package wssyncer

import (
	"encoding/json"
	"net/http"
	"sync"
	"syncer-backend/src/events"
	"syncer-backend/src/models"
	"syncer-backend/src/timer"
	"syncer-backend/src/utils"
	"time"

	"github.com/gorilla/websocket"
	"github.com/puzpuzpuz/xsync"
	"go.uber.org/zap"
)

func NewWsEndpointer() models.EndpointInterface {
	timers := timer.NewTimerMap()

	return &WsEndpoints{
		Timers:         timers,
		UpdateChannels: xsync.NewMapOf[*xsync.MapOf[string, chan events.TimerEventResponse]](),
		Dao:            NewDao(),
	}
}

/*
Teacher connection handler
- Handles the WebSocket connection for the teacher
- Stores the messages in the db
- Updates the timer for the class
*/
func (e *WsEndpoints) HandleTeacherConnection(w http.ResponseWriter, r *http.Request) {
	log := zap.S()

	lock := &sync.Mutex{}
	conn, ch, closeChan := e.teacherConnectionInit(w, r, lock)

	if conn == nil || ch == nil {
		return
	}

	conn.EnableWriteCompression(true)

	defer conn.Close()

	log.Info("Teacher connected")

	go (func() {
		for {
			select {
			case <-closeChan:
				log.Info("Closing go routine for teacher connection")
				return
			case updatedVec := <-ch:
				// TODO : lock to write to conn? [concurrent write error]
				err := tryToWriteJSON(conn, lock, updatedVec)

				if err != nil {
					log.Error("Error writing to WebSocket:", err)
					return
				}
			}
		}
	})()

	// loop to read messages from the WebSocket
	for {
		// read
		_, message, err := conn.ReadMessage()

		log.Infof("Received message: %v", message)

		if err != nil {
			log.Error("Error reading from WebSocket:", err)
			break
		}

		if len(message) == 0 {
			log.Info("Empty message received")
			continue
		}

		var event *events.Event

		// unmarshal the message
		err = json.Unmarshal(message, &event)

		if err != nil {
			log.Error("Error unmarshalling message:", err)
			err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling event message",
			})

			if err != nil {
				log.Error("Error writing to WebSocket:", err)
				return
			}

			return
		}

		eventData, err := json.Marshal(event.Data)

		if err != nil {
			log.Error("Error marshalling event data:", err)

			err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error marshalling event data",
			})

			if err != nil {
				log.Error("Error writing to WebSocket:", err)
			}

			return
		}

		// switch on the event type
		switch event.Type {
		case events.EVENT_QUEUE:
			queueEvent := events.QueueEvent{}
			err = json.Unmarshal(eventData, &queueEvent)
			log.Infof("Received event: %s %v", event.Type, queueEvent)

			if err != nil {
				log.Error("Error unmarshalling message:", err)

				err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling queue event",
				})

				if err != nil {
					log.Error("Error writing to WebSocket:", err)
				}

				return
			}

			// process data based on subtype
			e.processQueueEvent(event.ClassID, queueEvent, conn)

		case events.EVENT_CONTROLS:
			log.Infof("Received event: %s", event.Type)
			controlsEvent := events.ControlsEvent{}

			err = json.Unmarshal(message, &controlsEvent)

			if err != nil {
				log.Error("Error unmarshalling message:", err)

				err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling controls event",
				})

				if err != nil {
					log.Error("Error writing to WebSocket:", err)
				}

				return
			}

			// process data based on subtype
			e.processControlsEvent(event.ClassID, controlsEvent, conn)

		case events.EVENT_TIMER_QUERY:
			log.Infof("Received event: %s", event.Type)

			// timerEvent := events.TimerEventQueryData{}

			// temp, err := json.Marshal(event.Data)

			// if err != nil {
			// 	tryToWriteJSON(conn, lock, events.EventTeacherResponse{
			// 		Status:  events.EVENT_STATUS_NACK,
			// 		Message: "Error unmarshalling timer query event",
			// 	})
			// 	log.Errorf("Error unmarshalling timer event: %v", timerEvent)
			// 	continue
			// }

			// err = json.Unmarshal(temp, &timerEvent)

			// if err != nil {
			// 	tryToWriteJSON(conn, lock, events.EventTeacherResponse{
			// 		Status:  events.EVENT_STATUS_NACK,
			// 		Message: "Error unmarshalling timer query event",
			// 	})
			// 	log.Errorf("Error unmarshalling timer event: %v", timerEvent)
			// 	continue
			// }

			// send current vector
			timerVector, err := e.Timers.GetTimeVectorNew(event.ClassID)

			if err != nil {
				log.Error("Error getting timer vector:", err)
				err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error getting timer vector",
				})

				if err != nil {
					return
				}

				continue
			}

			err = tryToWriteJSON(conn, lock, events.TimerEventResponse{
				Status: events.EVENT_STATUS_ACK,
				Data:   timerVector,
			})

			if err != nil {
				return
			}

		case events.EVENT_TIMER_UPDATE:
			log.Infof("Received event: %s", event.Type)

			timerEvent := events.TimerEventUpdateData{
				TimerVector: &events.TimerVector{},
			}

			temp, err := json.Marshal(event.Data)

			if err != nil {
				log.Errorf("Error unmarshalling timer event: %v", timerEvent)

				err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer query event",
				})

				if err != nil {
					log.Error("Error writing to WebSocket:", err)
					return
				}

				continue
			}

			err = json.Unmarshal(temp, &timerEvent)
			log.Infof("[EVENT_TIMER_UPDATE] unmarshalled")

			if err != nil {
				log.Errorf("Error unmarshalling timer event: %v", timerEvent)

				err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer query event",
				})

				if err != nil {
					log.Error("Error writing to WebSocket:", err)
					return
				}

				continue
			}

			eventTime := time.Now().UnixMilli()

			log.Infof(
				"[EVENT_TIMER_UPDATE] updating",
				utils.ValueOrDefaultFloat32(timerEvent.Position, -1),
				utils.ValueOrDefaultFloat32(timerEvent.Velocity, -1),
				utils.ValueOrDefaultFloat32(timerEvent.Acceleration, -1),
				eventTime,
			)

			// update the timer object
			err = e.Timers.UpdateTimeNew(
				event.ClassID,
				utils.ValueOrDefaultFloat32(timerEvent.Position, -1),
				utils.ValueOrDefaultFloat32(timerEvent.Velocity, -1),
				utils.ValueOrDefaultFloat32(timerEvent.Acceleration, -1),
				eventTime,
			)
			log.Infof("[EVENT_TIMER_UPDATE] updated")

			if err != nil {
				log.Error("Error updating timer vector:", err)
				err = tryToWriteJSON(conn, lock, events.TimerEventResponse{
					Type:   events.EVENT_TIMER_CHANGE,
					Status: events.EVENT_STATUS_NACK,
					Data:   map[string]string{"message": "Error updating timer vector"},
				})

				if err != nil {
					return
				}
				continue
			}

			// multicast the update to all students
			chs, ok := e.UpdateChannels.Load(event.ClassID)

			if !ok {
				err = tryToWriteJSON(conn, lock, events.TimerEventResponse{
					Type:   events.EVENT_TIMER_CHANGE,
					Status: events.EVENT_STATUS_NACK,
					Data:   map[string]string{"message": "Class not found"},
				})

				if err != nil {
					return
				}
				continue
			}

			newVec := events.TimerVector{
				Position:     timerEvent.Position,
				Velocity:     timerEvent.Velocity,
				Acceleration: timerEvent.Acceleration,
				Timestamp:    eventTime,
			}

			chs.Range(
				// TODO : change channel to a struct with Type of event
				func(key string, value chan events.TimerEventResponse) bool {
					value <- events.TimerEventResponse{
						Type:   events.EVENT_TIMER_CHANGE,
						Status: events.EVENT_STATUS_ACK,
						Data:   newVec,
					}
					return true
				},
			)

		case events.EVENT_TIMER:
			log.Infof("Received event: %s", event.Type)

		case events.EVENT_TIMER_TIMEUPDATE:
			log.Infof("Received event: %s", event.Type)

		case events.EVENT_TIMER_CHANGE:
			log.Infof("Received event: %s", event.Type)

		default:
			log.Errorf("[ERROR] Received event: %s", event.Type)
		}

		err = tryToWriteJSON(conn, lock, events.EventTeacherResponse{
			Status: events.EVENT_STATUS_ACK,
		})

		if err != nil {
			log.Error("Error writing to WebSocket:", err)
			return
		}
	}

}

/*
Student connection handler
- Handles the WebSocket connection for the student
- Polls for events from the db and sends to students
*/
func (e *WsEndpoints) HandleStudentConnection(w http.ResponseWriter, r *http.Request) {
	log := zap.S()

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Error("Error upgrading to WebSocket:", err)
		return
	}

	log.Info("Teacher connected")

	defer conn.Close()

	// // read class id to initialize the connection
	// studentEventInitReq := events.StudentEventInitRequest{}

	// conn.ReadJSON(&studentEventInitReq)

	// classID := studentEventInitReq.ClassID

	// if classID == "" {
	// 	conn.WriteJSON(events.EventStudentResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Invalid class ID",
	// 	})
	// 	return
	// }

	// // initialize the subscription to update channel for the class
	// ch := make(chan float32)
	// chs, ok := e.UpdateChannels.Load(classID)

	// if !ok {
	// 	conn.WriteJSON(events.EventStudentResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Class not found",
	// 	})
	// 	return
	// }

	// chs = append(chs, ch)
	// e.UpdateChannels.Store(classID, chs)

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

	// 		evs, err := e.ProcessQueueEventsPoll()

	// 		if err != nil {
	// 			conn.WriteJSON(events.EventStudentResponse{
	// 				Status:  events.EVENT_STATUS_NACK,
	// 				Message: "Error polling for events",
	// 			})
	// 			log.Error("Error polling for events:", err)
	// 		}

	// 		// get the max of event time

	// 		// send events to students
	// 		msg := events.EventStudentResponse{
	// 			Status:      events.EVENT_STATUS_ACK,
	// 			Message:     fmt.Sprintf("[FIRED BY TIMER] Event from class %s", classID),
	// 			QueueEvents: evs,
	// 		}

	// 		err = conn.WriteJSON(msg)

	// 		if err != nil {
	// 			conn.WriteJSON(events.EventTeacherResponse{
	// 				Status:  events.EVENT_STATUS_NACK,
	// 				Message: "Error writing to WebSocket",
	// 			})
	// 			log.Error("Error writing to WebSocket:", err)
	// 			return
	// 		}

	// 	case <-ch:
	// 		// poll for events
	// 		// send events to students
	// 		msg := events.EventStudentResponse{
	// 			Status:  events.EVENT_STATUS_ACK,
	// 			Message: fmt.Sprintf("[FIRED BY UPDATE] Event from class %s", classID),
	// 		}

	// 		err := conn.WriteJSON(msg)

	// 		if err != nil {
	// 			conn.WriteJSON(events.EventTeacherResponse{
	// 				Status:  events.EVENT_STATUS_NACK,
	// 				Message: "Error writing to WebSocket",
	// 			})
	// 			log.Error("Error writing to WebSocket:", err)
	// 			return
	// 		}

	// 		timer.Reset(2 * time.Second)

	// 	}
	// }

}

func (w *WsEndpoints) processQueueEvent(classID string, queueEvent events.QueueEvent, conn *websocket.Conn) {
	log := zap.S()

	log.Infof("Processing : %s %s", queueEvent.SubType, classID)

	eventData, err := json.Marshal(queueEvent.Data)

	if err != nil {
		log.Error("Error marshalling queue event data:", err)

		err = conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Error marshalling queue event data",
		})

		if err != nil {
			log.Error("Error writing to conn:", err)
		}

		return
	}

	switch queueEvent.SubType {
	case events.EVENT_QUEUE_PUSH:
		pushEventData := events.QueueEventPushData{}
		err = json.Unmarshal(eventData, &pushEventData)

		if err != nil {
			log.Error("Error unmarshalling message:")

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling queue push data",
			})

			if err != nil {
				log.Error("Error writing to conn:", err)
			}

			return
		}

		queueEvent.Data = pushEventData

		// push to the db
		err := w.Dao.AddToActionsQueue(classID, &queueEvent)

		if err != nil {
			log.Error("Error adding to actions queue:", err)

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})

			if err != nil {
				log.Error("Error writing to conn:", err)
			}

			return
		}

	case events.EVENT_QUEUE_POP:
		popEventData := events.QueueEventPopData{}
		err = json.Unmarshal(eventData, &popEventData)

		if err != nil {
			log.Error("Error unmarshalling message:")

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling queue push data",
			})

			if err != nil {
				log.Error("Error writing to conn:", err)
			}

			return
		}

		queueEvent.Data = popEventData

		// push to the db
		err := w.Dao.AddToActionsQueue(classID, &queueEvent)

		if err != nil {
			log.Error("Error adding to actions queue:", err)

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})

			if err != nil {
				log.Error("Error writing to conn:", err)
			}

			return
		}

	case events.EVENT_QUEUE_CLEAR:
		err = w.Dao.AddToActionsQueue(classID, &queueEvent)

		if err != nil {
			log.Error("Error adding to actions queue:", err)

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})

			if err != nil {
				log.Error("Error writing to conn:", err)
			}

			return
		}

	default:
		err = conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid queue event subtype",
		})

		if err != nil {
			log.Error("Error writing to conn:", err)
		}

	}
}

func (w *WsEndpoints) processControlsEvent(classID string, controlsEvent events.ControlsEvent, conn *websocket.Conn) {
	// switch controlsEvent.SubType {
	// case events.EVENT_CONTROLS_PLAY:
	// case events.EVENT_CONTROLS_PAUSE:
	// case events.EVENT_CONTROLS_NEXT:
	// case events.EVENT_CONTROLS_PREV:
	// 	class.AddToControlsQueue(w.dbClient, classID, controlsEvent)

	// case events.EVENT_CONTROLS_SEEK_TO:
	// 	_, ok := (controlsEvent.Data).(events.ControlsEventSeekToData)

	// 	if !ok {
	// 		conn.WriteJSON(events.EventTeacherResponse{
	// 			Status:  events.EVENT_STATUS_NACK,
	// 			Message: "Error unmarshalling seek to data",
	// 		})

	// 		log.Error("Error type casting seek to data")
	// 		return
	// 	}

	// 	class.AddToControlsQueue(w.dbClient, classID, controlsEvent)

	// case events.EVENT_CONTROLS_SEEK_MARKER:
	// 	_, ok := (controlsEvent.Data).(events.ControlsEventSeekMarkerData)

	// 	if !ok {
	// 		conn.WriteJSON(events.EventTeacherResponse{
	// 			Status:  events.EVENT_STATUS_NACK,
	// 			Message: "Error unmarshalling seek marker data",
	// 		})

	// 		log.Error("Error type casting seek marker data")
	// 		return
	// 	}

	// 	class.AddToControlsQueue(w.dbClient, classID, controlsEvent)

	// default:
	// 	conn.WriteJSON(events.EventTeacherResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Invalid controls event subtype",
	// 	})
	// }
}

func (w *WsEndpoints) TickerHandler(classID string, t *timer.Timer) {
	log := zap.S()

	// TODO : make done part work where position > endPosition

	chans, ok := w.UpdateChannels.Load(classID)

	if !ok {
		return
	}

	for {
		select {
		case <-t.Done:
			return
		case tic := <-t.Ticker.C:
			now := tic.UnixMilli()
			ticToFloat := float32(now - t.LastUpdated)

			if t.Velocity == 0 {
				t.LastUpdated = now
				break
			}

			pos := timer.CalculatePosition(t.Position, ticToFloat, t.Velocity, t.Acceleration)
			log.Debugf("Tick at", tic, t.Velocity, pos)

			ticData := events.TimerVector{
				Position:     &pos,
				Velocity:     &t.Velocity,
				Acceleration: &t.Acceleration,
				Timestamp:    now,
			}

			t.Position = *ticData.Position
			t.LastUpdated = now

			chans.Range(func(_ string, value chan events.TimerEventResponse) bool {
				value <- events.TimerEventResponse{
					Type:   events.EVENT_TIMER_TIMEUPDATE,
					Status: events.EVENT_STATUS_ACK,
					Data:   ticData,
				}

				return true
			})

		}
	}
}
