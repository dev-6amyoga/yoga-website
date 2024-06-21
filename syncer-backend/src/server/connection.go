package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"syncer-backend/src/events"
	"time"
)

/*
Teacher connection handler
- Handles the WebSocket connection for the teacher
- Stores the messages in the db
- Updates the timer for the class
*/
func (s *Server) handleTeacherConnection(w http.ResponseWriter, r *http.Request) {
	// try to upgrade the connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		s.logger.Error("Error upgrading to WebSocket:", err)
		return
	}

	s.logger.Info("Teacher connected")

	// close the connection when the function returns
	defer conn.Close()

	// loop to read messages from the WebSocket
	for {
		// read
		_, message, err := conn.ReadMessage()

		if err != nil {
			break
		}

		var event *events.Event

		// unmarshal the message
		err = json.Unmarshal(message, &event)

		if err != nil {
			s.logger.Error("Error unmarshalling message:", err)
			conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling event message",
			})
			return
		}

		// switch on the event type
		switch event.Type {
		case events.EVENT_QUEUE:
			s.logger.Infof("Received event: %s", event.Type)
			queueEvent := events.QueueEvent{}
			err = json.Unmarshal(message, &queueEvent)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
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
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling controls event",
				})
				s.logger.Error("Error unmarshalling message:", err)
				return
			}

			// process data based on subtype
			s.ProcessControlsEvent(event.ClassID, controlsEvent, conn)

		case events.EVENT_TIMER:
			s.logger.Infof("Received event: %s", event.Type)

			timerEvent := events.TimerEvent{}

			temp, err := json.Marshal(event.Data)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer event",
				})
				s.logger.Errorf("Error unmarshalling timer event: %v", timerEvent)
				return
			}

			err = json.Unmarshal(temp, &timerEvent)

			if err != nil {

				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer event",
				})
				s.logger.Errorf("Error unmarshalling timer event: %v", timerEvent)
				return
			}

			s.logger.Infof("Timer event: %v; %v", timerEvent.CurrentTime, timerEvent.EventTime)

			et, err := time.Parse(time.RFC3339, timerEvent.EventTime)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error parsing time",
				})
				s.logger.Error("Error parsing time:", err)
				return
			}

			err = s.Timers.UpdateTime(event.ClassID, timerEvent.CurrentTime, et.UnixMilli())

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error updating timer",
				})
				s.logger.Error("Error updating timer:", err)
				return
			}

			chs, ok := s.UpdateChannels.Load(event.ClassID)

			if !ok {
				chs = make([]chan float64, 0)

				s.UpdateChannels.Store(event.ClassID, chs)
			} else {
				// update all the channels
				for _, ch := range chs {
					ch <- timerEvent.CurrentTime
				}
			}
		}

		conn.WriteJSON(events.EventTeacherResponse{
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

	// read class id to initialize the connection
	studentEventInitReq := events.StudentEventInitRequest{}

	conn.ReadJSON(&studentEventInitReq)

	classId := studentEventInitReq.ClassID

	if classId == "" {
		conn.WriteJSON(events.EventStudentResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid class ID",
		})
		return
	}

	// initialize the subscription to update channel for the class
	ch := make(chan float64)
	chs, ok := s.UpdateChannels.Load(classId)

	if !ok {
		conn.WriteJSON(events.EventStudentResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Class not found",
		})
		return
	}

	chs = append(chs, ch)
	s.UpdateChannels.Store(classId, chs)

	// close the channel when the function returns/errors out
	defer close(ch)

	timer := time.NewTicker(2 * time.Second)

	conn.WriteJSON(events.EventStudentResponse{
		Status:  events.EVENT_STATUS_ACK,
		Message: "Connection established",
	})

	for {
		select {

		case <-timer.C:
			// TODO : poll for events
			// send events to students
			msg := events.EventStudentResponse{
				Status:  events.EVENT_STATUS_ACK,
				Message: fmt.Sprintf("[FIRED BY TIMER] Event from class %s", classId),
			}

			err := conn.WriteJSON(msg)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error writing to WebSocket",
				})
				s.logger.Error("Error writing to WebSocket:", err)
				return
			}

		case <-ch:
			// poll for events
			// send events to students
			msg := events.EventStudentResponse{
				Status:  events.EVENT_STATUS_ACK,
				Message: fmt.Sprintf("[FIRED BY UPDATE] Event from class %s", classId),
			}

			err := conn.WriteJSON(msg)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error writing to WebSocket",
				})
				s.logger.Error("Error writing to WebSocket:", err)
				return
			}

			timer.Reset(2 * time.Second)

		}
	}

}
