package server

import (
	"encoding/json"
	"net/http"
	"syncer-backend/src/events"
)

/*
Teacher connection handler
- Handles the WebSocket connection for the teacher
- Stores the messages in the db
*/
func (s *Server) handleTeacherConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		s.logger.Error("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		event := events.Event{}

		err = json.Unmarshal(message, &event)

		if err != nil {
			s.logger.Error("Error unmarshalling message:", err)
			return
		}

		switch event.Type {
		case events.EVENT_QUEUE:
			queueEvent := events.QueueEvent{}
			err = json.Unmarshal(message, &queueEvent)

			if err != nil {
				conn.WriteJSON(events.EVENT_NACK)
				s.logger.Error("Error unmarshalling message:", err)
				return
			}
		case events.EVENT_CONTROLS:
			controlsEvent := events.ControlsEvent{}

			err = json.Unmarshal(message, &controlsEvent)

			if err != nil {
				conn.WriteJSON(events.EVENT_NACK)
				s.logger.Error("Error unmarshalling message:", err)
				return
			}
		}

		conn.WriteJSON(events.EVENT_ACK)
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
			conn.WriteJSON(events.EVENT_NACK)
			s.logger.Error("Error writing to WebSocket:", err)
			return
		}

		conn.WriteJSON(msg)
	}
}
