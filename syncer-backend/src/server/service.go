package server

import (
	"encoding/json"
	"syncer-backend/src/class"
	"syncer-backend/src/events"

	"github.com/gorilla/websocket"
)

func (s *Server) ProcessQueueEvent(classId string, queueEvent events.QueueEvent, conn *websocket.Conn) {
	s.logger.Infof("Processing : %s %s", queueEvent.SubType, classId)

	eventData, err := json.Marshal(queueEvent.Data)

	if err != nil {
		conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Error marshalling queue event data",
		})
		s.logger.Error("Error marshalling queue event data:", err)
		return
	}

	switch queueEvent.SubType {
	case events.EVENT_QUEUE_PUSH:
		pushEventData := events.QueueEventPushData{}
		err = json.Unmarshal(eventData, &pushEventData)

		if err != nil {
			conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling queue push data",
			})
			s.logger.Error("Error unmarshalling message:")
			return
		}

		queueEvent.Data = pushEventData

		// push to the db
		err := class.AddToActionsQueue(s.dbClient, classId, queueEvent)

		if err != nil {
			conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})
			s.logger.Error("Error adding to actions queue:", err)
			return
		}

	case events.EVENT_QUEUE_POP:
		popEventData := events.QueueEventPopData{}
		err = json.Unmarshal(eventData, &popEventData)

		if err != nil {
			conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error unmarshalling queue push data",
			})
			s.logger.Error("Error unmarshalling message:")
			return
		}

		queueEvent.Data = popEventData

		// push to the db
		err := class.AddToActionsQueue(s.dbClient, classId, queueEvent)

		if err != nil {
			conn.WriteJSON(events.EventTeacherResponse{
				Status:  events.EVENT_STATUS_NACK,
				Message: "Error adding to actions queue",
			})
			s.logger.Error("Error adding to actions queue:", err)
			return
		}

	case events.EVENT_QUEUE_CLEAR:
		class.AddToActionsQueue(s.dbClient, classId, queueEvent)

	default:
		conn.WriteJSON(events.EventTeacherResponse{
			Status:  events.EVENT_STATUS_NACK,
			Message: "Invalid queue event subtype",
		})

	}
}

func (s *Server) ProcessControlsEvent(classId string, controlsEvent events.ControlsEvent, conn *websocket.Conn) {

	// switch controlsEvent.SubType {
	// case events.EVENT_CONTROLS_PLAY:
	// case events.EVENT_CONTROLS_PAUSE:
	// case events.EVENT_CONTROLS_NEXT:
	// case events.EVENT_CONTROLS_PREV:
	// 	class.AddToControlsQueue(s.dbClient, classId, controlsEvent)

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

	// 	class.AddToControlsQueue(s.dbClient, classId, controlsEvent)

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

	// 	class.AddToControlsQueue(s.dbClient, classId, controlsEvent)

	// default:
	// 	conn.WriteJSON(events.EventTeacherResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Invalid controls event subtype",
	// 	})
	// }
}
