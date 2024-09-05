package server

import (
	"encoding/json"
	"net/http"
	"sync"
	"syncer-backend/src/events"
	"time"

	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync"
)

func tryToWrite(conn *websocket.Conn, lock *sync.Mutex, msg interface{}) error {
	lock.Lock()
	defer lock.Unlock()

	err := conn.WriteJSON(msg)

	if err != nil {
		return err
	}
	return nil
}

func (s *Server) teacherConnectionInit(w http.ResponseWriter, r *http.Request, lock *sync.Mutex) (*websocket.Conn, chan events.TimerVector, chan bool) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		s.logger.Error("Error upgrading to WebSocket:", err)
		return nil, nil, nil
	}

	// read class id to initialize the connection
	event := events.Event{}
	teacherEventInitReq := events.TeacherEventInitRequest{}

	conn.ReadJSON(&event)

	if event.ClassID == "" {
		conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid class ID",
		})
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
	var chs *xsync.MapOf[string, chan events.TimerVector] = nil
	var ch chan events.TimerVector = nil
	var loadedUpdateChannels, loadedUserUpdateChannel bool = false, false

	s.logger.Infof("Loading update channels for class %s", event.ClassID)
	chs, loadedUpdateChannels = s.UpdateChannels.Load(event.ClassID)

	s.logger.Infof("Loaded update channels for class %v", loadedUpdateChannels)

	if !loadedUpdateChannels {
		newMap := xsync.NewMapOf[chan events.TimerVector]()
		s.logger.Infof("Storing a new update channel for class %s", event.ClassID)
		chs, loadedUpdateChannels = s.UpdateChannels.LoadOrStore(event.ClassID, newMap)

		s.logger.Infof("Loaded a new update channel for class %s", loadedUpdateChannels, chs)
	}

	if !loadedUpdateChannels {
		// initialize the subscription to update channel for the class
		// TODO : fix the buffer size
		ch = make(chan events.TimerVector, 1)
		chs.Store(event.UserID, ch)
	} else {
		ch, loadedUserUpdateChannel = chs.Load(event.UserID)

		if !loadedUserUpdateChannel {
			ch = make(chan events.TimerVector, 1)
			chs.Store(event.UserID, ch)
		}
	}

	// send time updates
	// go (func(ch chan events.TimerVector, conn *websocket.Conn) {
	// 	s.logger.Infof("Listening to updates for userId: %s, classId: %s", event.UserID, event.ClassID)
	// 	for updatedVec := range ch {
	// 		err = conn.WriteJSON(events.TimerEventTimeUpdateData{
	// 			Data: updatedVec,
	// 		})

	// 		if err != nil {
	// 			s.logger.Error("Error writing to WebSocket:", err)
	// 			return
	// 		}
	// 	}
	// })(ch, conn)

	s.logger.Infof("Stored a update channel for userId : %s , classId: %s", event.UserID, event.ClassID)

	// TIMER CHANNEL FOR CLASS --------------------------------------------
	_, loadedTimerClassChannel := s.Timers.Map.Load(event.ClassID)

	if !loadedTimerClassChannel {
		s.logger.Infof("Initializing timer for class %s", event.ClassID)
		// initialize the timer for the class
		timer, err := s.Timers.AddTimerNew(
			event.ClassID,
			teacherEventInitReq.StartPosition,
			teacherEventInitReq.EndPosition,
			teacherEventInitReq.Velocity,
			teacherEventInitReq.Acceleration,
		)

		if err != nil {
			s.logger.Error("Error initializing timer for class:", err)
			tryToWrite(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error initializing timer for class",
			})
		}

		// start the timer
		s.logger.Infof("Starting ticker timer for class %s", event.ClassID)
		go s.TickerHandler(event.ClassID, timer)
	} else {
		s.logger.Infof("Ticker exists for %s", event.ClassID)
	}

	err = tryToWrite(conn, lock, events.EventTeacherResponse{
		Status:  events.EVENT_STATUS_ACK,
		Message: "Connection established",
	})

	if err != nil {
		return nil, nil, nil
	}

	closeChan := make(chan bool, 1)

	conn.SetCloseHandler(func(code int, text string) error {
		s.logger.Infof("Connection closed with code: %d, text: %s", code, text)

		// close the update channel
		chs, ok := s.UpdateChannels.Load(event.ClassID)

		if !ok {
			s.logger.Infof("No update channels found for class %s", event.ClassID)
			return nil
		}

		ch, ok := chs.Load(event.UserID)

		if !ok {
			s.logger.Infof("No update channels found for user %s", event.UserID)
			return nil
		}

		s.logger.Infof("Closing update channel for user %s", event.UserID)
		close(ch)

		chs.Delete(event.UserID)

		closeChan <- true

		return nil
	})

	return conn, ch, closeChan
}

/*
Teacher connection handler
- Handles the WebSocket connection for the teacher
- Stores the messages in the db
- Updates the timer for the class
*/
func (s *Server) handleTeacherConnection(w http.ResponseWriter, r *http.Request) {
	lock := &sync.Mutex{}
	conn, ch, closeChan := s.teacherConnectionInit(w, r, lock)

	if conn == nil || ch == nil {
		return
	}

	conn.EnableWriteCompression(true)

	defer conn.Close()

	s.logger.Info("Teacher connected")

	go (func() {
		for {
			select {
			case <-closeChan:
				s.logger.Info("Closing go routine for teacher connection")
				return
			case updatedVec := <-ch:
				// TODO : lock to write to conn? [concurrent write error]
				err := tryToWrite(conn, lock, events.TimerEventTimeUpdateData{
					Data: updatedVec,
				})

				if err != nil {
					s.logger.Error("Error writing to WebSocket:", err)
					return
				}
			}
		}
	})()

	// loop to read messages from the WebSocket
	for {
		// read
		_, message, err := conn.ReadMessage()

		s.logger.Infof("Received message: %v", message)

		if err != nil {
			s.logger.Error("Error reading from WebSocket:", err)
			break
		}

		if len(message) == 0 {
			s.logger.Info("Empty message received")
			continue
		}

		var event *events.Event

		// unmarshal the message
		err = json.Unmarshal(message, &event)

		if err != nil {
			s.logger.Error("Error unmarshalling message:", err)
			tryToWrite(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling event message",
			})
			return
		}

		eventData, err := json.Marshal(event.Data)

		if err != nil {
			tryToWrite(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error marshalling event data",
			})
			s.logger.Error("Error marshalling event data:", err)
			return
		}

		// switch on the event type
		switch event.Type {
		case events.EVENT_QUEUE:
			queueEvent := events.QueueEvent{}
			err = json.Unmarshal(eventData, &queueEvent)
			s.logger.Infof("Received event: %s %v", event.Type, queueEvent)

			if err != nil {
				tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling queue event",
				})
				s.logger.Error("Error unmarshalling message:", err)
				return
			}

			// process data based on subtype
			s.ProcessQueueEvent(event.ClassID, queueEvent, conn)

		case events.EVENT_CONTROLS:
			s.logger.Infof("Received event: %s", event.Type)
			controlsEvent := events.ControlsEvent{}

			err = json.Unmarshal(message, &controlsEvent)

			if err != nil {
				tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling controls event",
				})
				s.logger.Error("Error unmarshalling message:", err)
				return
			}

			// process data based on subtype
			s.ProcessControlsEvent(event.ClassID, controlsEvent, conn)

		case events.EVENT_TIMER_QUERY:
			s.logger.Infof("Received event: %s", event.Type)

			// timerEvent := events.TimerEventQueryData{}

			// temp, err := json.Marshal(event.Data)

			// if err != nil {
			// 	tryToWrite(conn, lock, events.EventTeacherResponse{
			// 		Status:  events.EVENT_STATUS_NACK,
			// 		Message: "Error unmarshalling timer query event",
			// 	})
			// 	s.logger.Errorf("Error unmarshalling timer event: %v", timerEvent)
			// 	continue
			// }

			// err = json.Unmarshal(temp, &timerEvent)

			// if err != nil {
			// 	tryToWrite(conn, lock, events.EventTeacherResponse{
			// 		Status:  events.EVENT_STATUS_NACK,
			// 		Message: "Error unmarshalling timer query event",
			// 	})
			// 	s.logger.Errorf("Error unmarshalling timer event: %v", timerEvent)
			// 	continue
			// }

			// send current vector
			timerVector, err := s.Timers.GetTimeVectorNew(event.ClassID)

			if err != nil {
				s.logger.Error("Error getting timer vector:", err)
				err = tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error getting timer vector",
				})

				if err != nil {
					return
				}

				continue
			}

			err = tryToWrite(conn, lock, events.TimerEventQueryResponse{
				Status: events.EVENT_STATUS_ACK,
				Data:   timerVector,
			})

			if err != nil {
				return
			}

		case events.EVENT_TIMER_UPDATE:
			s.logger.Infof("Received event: %s", event.Type)

			timerEvent := events.TimerEventUpdateData{}

			temp, err := json.Marshal(event.Data)

			if err != nil {
				tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer query event",
				})
				s.logger.Errorf("Error unmarshalling timer event: %v", timerEvent)
				continue
			}

			err = json.Unmarshal(temp, &timerEvent)

			if err != nil {
				tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer query event",
				})
				s.logger.Errorf("Error unmarshalling timer event: %v", timerEvent)
				continue
			}

			eventTime := time.Now().Unix()

			// update the timer object
			err = s.Timers.UpdateTimeNew(
				event.ClassID,
				timerEvent.Position,
				timerEvent.Velocity,
				timerEvent.Acceleration,
				eventTime,
			)

			if err != nil {
				s.logger.Error("Error updating timer vector:", err)
				err = tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error updating timer vector",
				})

				if err != nil {
					return
				}
				continue
			}

			// multicast the update to all students
			chs, ok := s.UpdateChannels.Load(event.ClassID)

			if !ok {
				err = tryToWrite(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Class not found",
				})

				if err != nil {
					return
				}
				continue
			}

			chs.Range(
				func(key string, value chan events.TimerVector) bool {
					value <- events.TimerVector{
						Position:     timerEvent.Position,
						Velocity:     timerEvent.Velocity,
						Acceleration: timerEvent.Acceleration,
						Timestamp:    eventTime,
					}
					return true
				},
			)

			err = tryToWrite(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_ACK,
				Message: "updated vector",
			})

			if err != nil {
				return
			}

		}

		tryToWrite(conn, lock, events.EventTeacherResponse{
			Status: events.EVENT_STATUS_ACK,
		})
	}

}

/*
Student connection handler
- Handles the WebSocket connection for the student
- Polls for events from the db and sends to students
*/
func (s *Server) handleStudentConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		s.logger.Error("Error upgrading to WebSocket:", err)
		return
	}

	s.logger.Info("Teacher connected")

	defer conn.Close()

	// // read class id to initialize the connection
	// studentEventInitReq := events.StudentEventInitRequest{}

	// conn.ReadJSON(&studentEventInitReq)

	// classId := studentEventInitReq.ClassID

	// if classId == "" {
	// 	conn.WriteJSON(events.EventStudentResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Invalid class ID",
	// 	})
	// 	return
	// }

	// // initialize the subscription to update channel for the class
	// ch := make(chan float32)
	// chs, ok := s.UpdateChannels.Load(classId)

	// if !ok {
	// 	conn.WriteJSON(events.EventStudentResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Class not found",
	// 	})
	// 	return
	// }

	// chs = append(chs, ch)
	// s.UpdateChannels.Store(classId, chs)

	// // close the channel when the function returns/errors out
	// defer close(ch)

	// timer := time.NewTicker(2 * time.Second)

	// conn.WriteJSON(events.EventStudentResponse{
	// 	Status:  events.EVENT_STATUS_ACK,
	// 	Message: "Connection established",
	// })

	// // var max_update_time time.Time

	// // max_update_time = time.Now()

	// for {
	// 	select {

	// 	case <-timer.C:
	// 		// TODO : poll for events

	// 		evs, err := s.ProcessQueueEventsPoll()

	// 		if err != nil {
	// 			conn.WriteJSON(events.EventStudentResponse{
	// 				Status:  events.EVENT_STATUS_NACK,
	// 				Message: "Error polling for events",
	// 			})
	// 			s.logger.Error("Error polling for events:", err)
	// 		}

	// 		// get the max of event time

	// 		// send events to students
	// 		msg := events.EventStudentResponse{
	// 			Status:      events.EVENT_STATUS_ACK,
	// 			Message:     fmt.Sprintf("[FIRED BY TIMER] Event from class %s", classId),
	// 			QueueEvents: evs,
	// 		}

	// 		err = conn.WriteJSON(msg)

	// 		if err != nil {
	// 			conn.WriteJSON(events.EventTeacherResponse{
	// 				Status:  events.EVENT_STATUS_NACK,
	// 				Message: "Error writing to WebSocket",
	// 			})
	// 			s.logger.Error("Error writing to WebSocket:", err)
	// 			return
	// 		}

	// 	case <-ch:
	// 		// poll for events
	// 		// send events to students
	// 		msg := events.EventStudentResponse{
	// 			Status:  events.EVENT_STATUS_ACK,
	// 			Message: fmt.Sprintf("[FIRED BY UPDATE] Event from class %s", classId),
	// 		}

	// 		err := conn.WriteJSON(msg)

	// 		if err != nil {
	// 			conn.WriteJSON(events.EventTeacherResponse{
	// 				Status:  events.EVENT_STATUS_NACK,
	// 				Message: "Error writing to WebSocket",
	// 			})
	// 			s.logger.Error("Error writing to WebSocket:", err)
	// 			return
	// 		}

	// 		timer.Reset(2 * time.Second)

	// 	}
	// }

}
