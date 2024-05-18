package server

import (
	"encoding/json"
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

	// close the connection when the function returns
	defer conn.Close()

	// loop to read messages from the WebSocket
	for {
		// read
		_, message, err := conn.ReadMessage()

		if err != nil {
			break
		}

		event := events.Event{}

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

			err = json.Unmarshal(message, &timerEvent)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error unmarshalling timer event",
				})
				s.logger.Error("Error unmarshalling message:", err)
				return
			}

			et, err := time.Parse(time.RFC3339, timerEvent.EventTime)

			if err != nil {
				conn.WriteJSON(events.EventTeacherResponse{
					Status:  events.EVENT_STATUS_NACK,
					Message: "Error parsing time",
				})
				s.logger.Error("Error parsing time:", err)
				return
			}

			s.timers.UpdateTime(event.ClassID, timerEvent.CurrentTime, et.UnixMilli())
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
	defer conn.Close()

	for {
		// poll for events
		// send events to students
		msg := []byte("{'message': 'Hello'}")

		err := conn.WriteJSON(msg)

		if err != nil {
			conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error writing to WebSocket",
			})
			s.logger.Error("Error writing to WebSocket:", err)
			return
		}
	}
}
