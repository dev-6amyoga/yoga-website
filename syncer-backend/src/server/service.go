package server

import (
	"encoding/json"
	"syncer-backend/src/class"
	"syncer-backend/src/events"

	"github.com/gorilla/websocket"
)

func (s *Server) ProcessQueueEvent(classID string, queueEvent events.QueueEvent, conn *websocket.Conn) {
	s.logger.Infof("Processing : %s %s", queueEvent.SubType, classID)

	eventData, err := json.Marshal(queueEvent.Data)

	if err != nil {
		s.logger.Error("Error marshalling queue event data:", err)

		err = conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Error marshalling queue event data",
		})

		if err != nil {
			s.logger.Error("Error writing to conn:", err)
		}

		return
	}

	switch queueEvent.SubType {
	case events.EVENT_QUEUE_PUSH:
		pushEventData := events.QueueEventPushData{}
		err = json.Unmarshal(eventData, &pushEventData)

		if err != nil {
			s.logger.Error("Error unmarshalling message:")

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling queue push data",
			})

			if err != nil {
				s.logger.Error("Error writing to conn:", err)
			}

			return
		}

		queueEvent.Data = pushEventData

		// push to the db
		err := class.AddToActionsQueue(s.dbClient, classID, queueEvent)

		if err != nil {
			s.logger.Error("Error adding to actions queue:", err)

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})

			if err != nil {
				s.logger.Error("Error writing to conn:", err)
			}

			return
		}

	case events.EVENT_QUEUE_POP:
		popEventData := events.QueueEventPopData{}
		err = json.Unmarshal(eventData, &popEventData)

		if err != nil {
			s.logger.Error("Error unmarshalling message:")

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling queue push data",
			})

			if err != nil {
				s.logger.Error("Error writing to conn:", err)
			}

			return
		}

		queueEvent.Data = popEventData

		// push to the db
		err := class.AddToActionsQueue(s.dbClient, classID, queueEvent)

		if err != nil {
			s.logger.Error("Error adding to actions queue:", err)

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})

			if err != nil {
				s.logger.Error("Error writing to conn:", err)
			}

			return
		}

	case events.EVENT_QUEUE_CLEAR:
		err = class.AddToActionsQueue(s.dbClient, classID, queueEvent)

		if err != nil {
			s.logger.Error("Error adding to actions queue:", err)

			err = conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})

			if err != nil {
				s.logger.Error("Error writing to conn:", err)
			}

			return
		}

	default:
		err = conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid queue event subtype",
		})

		if err != nil {
			s.logger.Error("Error writing to conn:", err)
		}

	}
}

func (s *Server) ProcessQueueEventsPoll() ([]events.QueueEvent, error) {
	// get all events from the db

	// return them

	return nil, nil
}

func (s *Server) ProcessControlsEvent(classID string, controlsEvent events.ControlsEvent, conn *websocket.Conn) {

	// switch controlsEvent.SubType {
	// case events.EVENT_CONTROLS_PLAY:
	// case events.EVENT_CONTROLS_PAUSE:
	// case events.EVENT_CONTROLS_NEXT:
	// case events.EVENT_CONTROLS_PREV:
	// 	class.AddToControlsQueue(s.dbClient, classID, controlsEvent)

	// case events.EVENT_CONTROLS_SEEK_TO:
	// 	_, ok := (controlsEvent.Data).(events.ControlsEventSeekToData)

	// 	if !ok {
	// 		conn.WriteJSON(events.EventTeacherResponse{
	// 			Status:  events.EVENT_STATUS_NACK,
	// 			Message: "Error unmarshalling seek to data",
	// 		})

	// 		s.logger.Error("Error type casting seek to data")
	// 		return
	// 	}

	// 	class.AddToControlsQueue(s.dbClient, classID, controlsEvent)

	// case events.EVENT_CONTROLS_SEEK_MARKER:
	// 	_, ok := (controlsEvent.Data).(events.ControlsEventSeekMarkerData)

	// 	if !ok {
	// 		conn.WriteJSON(events.EventTeacherResponse{
	// 			Status:  events.EVENT_STATUS_NACK,
	// 			Message: "Error unmarshalling seek marker data",
	// 		})

	// 		s.logger.Error("Error type casting seek marker data")
	// 		return
	// 	}

	// 	class.AddToControlsQueue(s.dbClient, classID, controlsEvent)

	// default:
	// 	conn.WriteJSON(events.EventTeacherResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Invalid controls event subtype",
	// 	})
	// }
}
