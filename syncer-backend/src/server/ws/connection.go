package wssyncer

import (
	"encoding/json"
	"errors"
	"net/http"
	"sync"
	"syncer-backend/src/events"

	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync"
	"go.uber.org/zap"
)

func tryToWriteJSON(conn *websocket.Conn, lock *sync.Mutex, msg any) error {
	lock.Lock()
	defer lock.Unlock()

	err := conn.WriteJSON(msg)

	if err != nil {
		return err
	}
	return nil
}

// func tryToWrite(conn *websocket.Conn, lock *sync.Mutex, msg []byte) error {
// 	lock.Lock()
// 	defer lock.Unlock()

// 	err := conn.WriteMessage(websocket.TextMessage, msg)

// 	if err != nil {
// 		return err
// 	}
// 	return nil
// }

func (s *WsEndpoints) teacherConnectionInit(w http.ResponseWriter, r *http.Request, lock *sync.Mutex) (*websocket.Conn, chan events.TimerEventResponse, chan bool) {
	log := zap.S()

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Error("Error upgrading to WebSocket:", err)
		return nil, nil, nil
	}

	conn.EnableWriteCompression(true)

	// read class id to initialize the connection
	event := events.Event{}
	teacherEventInitReq := events.TeacherEventInitRequest{}

	err = conn.ReadJSON(&event)

	if err != nil {
		log.Error("Error reading from WebSocket:", err)
		return nil, nil, nil
	}

	if event.ClassID == "" {
		err = conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid class ID",
		})

		if err != nil {
			log.Error("Error writing to WebSocket:", err)
			return nil, nil, nil
		}

		return nil, nil, nil
	}

	// marshal the data
	eventData, err := json.Marshal(event.Data)

	if err != nil {
		return nil, nil, nil
	}

	// unmarshal the data
	err = json.Unmarshal(eventData, &teacherEventInitReq)

	if err != nil {
		return nil, nil, nil
	}

	// UPDATE CHANNEL --------------------------------------------
	// check if the class exists and get the teacher's channel
	var (
		chs                     *xsync.MapOf[string, chan events.TimerEventResponse]
		ch                      chan events.TimerEventResponse
		loadedUpdateChannels    bool
		loadedUserUpdateChannel bool
	)

	log.Debugf("Loading update channels for class %s", event.ClassID)

	chs, loadedUpdateChannels = s.UpdateChannels.Load(event.ClassID)

	log.Debugf("Loaded update channels for class %v", loadedUpdateChannels)

	if !loadedUpdateChannels {
		newMap := xsync.NewMapOf[chan events.TimerEventResponse]()
		log.Debugf("Storing a new update channel for class %s", event.ClassID)

		chs, loadedUpdateChannels = s.UpdateChannels.LoadOrStore(event.ClassID, newMap)

		log.Debugf("Loaded a new update channel for class %s", loadedUpdateChannels, chs)
	}

	// if there were no update channels for the class,
	// teacher update chan didnt exist either
	if !loadedUpdateChannels {
		// initialize the subscription to update channel for the class
		// TODO : fix the buffer size
		ch = make(chan events.TimerEventResponse, 1)
		chs.Store(event.UserID, ch)
	} else {
		// check if the teacher's update channel exists
		ch, loadedUserUpdateChannel = chs.Load(event.UserID)

		if !loadedUserUpdateChannel {
			ch = make(chan events.TimerEventResponse, 1)
			chs.Store(event.UserID, ch)
		}
	}

	log.Debugf("Stored a update channel for userId : %s , classID: %s", event.UserID, event.ClassID)

	// TIMER CHANNEL FOR CLASS --------------------------------------------
	_, loadedTimerClassChannel := s.Timers.Map.Load(event.ClassID)

	if !loadedTimerClassChannel {
		log.Debugf("Initializing timer for class %s", event.ClassID)

		// initialize the timer for the class
		timer, err := s.Timers.AddTimerNew(
			event.ClassID,
			teacherEventInitReq.StartPosition,
			teacherEventInitReq.EndPosition,
			*teacherEventInitReq.Velocity,
			*teacherEventInitReq.Acceleration,
		)

		if err != nil {
			log.Error("Error initializing timer for class:", err)
			err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error initializing timer for class",
			})

			if err != nil {
				log.Error("Error writing to WebSocket:", err)
				return nil, nil, nil
			}
		}

		// start the timer
		log.Debugf("Starting ticker timer for class %s", event.ClassID)
		go s.TickerHandler(event.ClassID, timer)
	} else {
		log.Debugf("Ticker exists for %s", event.ClassID)
	}

	err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
		Status:  events.EVENT_STATUS_ACK,
		Message: "Connection established",
	})

	if err != nil {
		return nil, nil, nil
	}

	closeChan := make(chan bool, 1)

	// clean up on connection close
	conn.SetCloseHandler(func(code int, text string) error {
		// TODO : check if error handling here is necessary
		log.Debugf("Connection closed with code: %d, text: %s", code, text)

		// close the update channel
		chs, ok := s.UpdateChannels.Load(event.ClassID)

		if !ok {
			log.Debugf("No update channels found for class %s", event.ClassID)
			return nil
		}

		ch, ok := chs.Load(event.UserID)

		if !ok {
			log.Debugf("No update channels found for user %s", event.UserID)
			return nil
		}

		log.Debugf("Closing update channel for user %s", event.UserID)
		close(ch)

		chs.Delete(event.UserID)

		closeChan <- true

		// TODO : delete the class if no more users are connected

		// TODO : if teacher disconnects, pause the timer
		err = s.Timers.UpdateTimeNew(event.ClassID, -1, 0, 0, -1)

		if err != nil {
			log.Error("Error updating timer for class:", err)
		}

		return nil
	})

	return conn, ch, closeChan
}

func (s *WsEndpoints) studentConnectionInit(w http.ResponseWriter, r *http.Request, lock *sync.Mutex) (
	*websocket.Conn,
	chan events.TimerEventResponse,
	chan bool,
	error,
) {
	log := zap.S()

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Error("Error upgrading to WebSocket:", err)
		return nil, nil, nil, err
	}

	conn.EnableWriteCompression(true)

	// read class id to initialize the connection
	event := events.Event{}
	studentEventInitReq := events.StudentEventInitRequest{}

	err = conn.ReadJSON(&event)
	if err != nil {
		log.Error("Error reading from WebSocket:", err)
		return nil, nil, nil, err
	}

	if event.ClassID == "" {
		err = conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid class ID",
		})
		if err != nil {
			log.Error("Error writing to WebSocket:", err)
			return nil, nil, nil, err
		}

		return nil, nil, nil, err
	}

	// marshal the data
	eventData, err := json.Marshal(event.Data)

	if err != nil {
		return nil, nil, nil, err
	}

	// unmarshal the data
	err = json.Unmarshal(eventData, &studentEventInitReq)

	if err != nil {
		return nil, nil, nil, err
	}

	// TIMER CHANNEL FOR CLASS -----------------------------------
	_, loadedTimerClassChannel := s.Timers.Map.Load(event.ClassID)

	if !loadedTimerClassChannel {
		log.Errorf("No class found for %s", event.ClassID)
		return nil, nil, nil, errors.New("no class found")
	}

	// UPDATE CHANNEL --------------------------------------------
	// check if the class exists and get the student's channel
	var (
		chs                     *xsync.MapOf[string, chan events.TimerEventResponse]
		ch                      chan events.TimerEventResponse
		loadedUpdateChannels    bool
		loadedUserUpdateChannel bool
	)

	log.Debugf("Loading update channels for class %s", event.ClassID)

	chs, loadedUpdateChannels = s.UpdateChannels.Load(event.ClassID)

	log.Debugf("Loaded update channels for class %v", loadedUpdateChannels)

	if !loadedUpdateChannels {
		log.Errorf("No update channels found for class %s", event.ClassID)
		return nil, nil, nil, errors.New("no update channels found for class")
	} else {
		// check if the student's update channel exists
		ch, loadedUserUpdateChannel = chs.Load(event.UserID)

		if !loadedUserUpdateChannel {
			ch = make(chan events.TimerEventResponse, 1)
			chs.Store(event.UserID, ch)
		}
	}

	log.Debugf("Stored a update channel for userId : %s , classID: %s", event.UserID, event.ClassID)

	err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
		Status:  events.EVENT_STATUS_ACK,
		Message: "Connection established",
	})

	if err != nil {
		return nil, nil, nil, err
	}

	closeChan := make(chan bool, 1)

	// clean up on connection close
	conn.SetCloseHandler(func(code int, text string) error {
		// TODO : check if error handling here is necessary
		log.Debugf("Connection closed with code: %d, text: %s", code, text)

		// close the update channel
		chs, ok := s.UpdateChannels.Load(event.ClassID)

		if !ok {
			log.Debugf("No update channels found for class %s", event.ClassID)
			return nil
		}

		ch, ok := chs.Load(event.UserID)

		if !ok {
			log.Debugf("No update channels found for user %s", event.UserID)
			return nil
		}

		log.Debugf("Closing update channel for user %s", event.UserID)
		close(ch)

		chs.Delete(event.UserID)

		closeChan <- true

		return nil
	})

	return conn, ch, closeChan, nil
}
