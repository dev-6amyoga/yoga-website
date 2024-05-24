package server

import (
	// "syncer-backend/src/class"
	"syncer-backend/src/events"

	"github.com/gorilla/websocket"
)

func (s *Server) ProcessQueueEvent(classId string, queueEvent events.QueueEvent, conn *websocket.Conn) {
	// switch queueEvent.SubType {
	// case events.EVENT_QUEUE_PUSH:
	// 	_, ok := (queueEvent.Data).(events.QueueEventPushData)

	// 	if !ok {
	// 		conn.WriteJSON(events.EventTeacherResponse{
	// 			Status:  events.EVENT_STATUS_NACK,
	// 			Message: "Error unmarshalling queue push data",
	// 		})
	// 		s.logger.Error("Error type casting push data")
	// 		return
	// 	}

	// 	// push to the db
	// 	class.AddToActionsQueue(s.dbClient, classId, queueEvent)

	// case events.EVENT_QUEUE_POP:
	// 	_, ok := (queueEvent.Data).(events.QueueEventPopData)

	// 	if !ok {
	// 		conn.WriteJSON(events.EventTeacherResponse{
	// 			Status:  events.EVENT_STATUS_NACK,
	// 			Message: "Error unmarshalling queue push data",
	// 		})
	// 		s.logger.Error("Error unmarshalling message:")
	// 		return
	// 	}

	// 	// push to the db
	// 	class.AddToActionsQueue(s.dbClient, classId, queueEvent)

	// case events.EVENT_QUEUE_CLEAR:
	// 	class.AddToActionsQueue(s.dbClient, classId, queueEvent)

	// default:
	// 	conn.WriteJSON(events.EventTeacherResponse{
	// 		Status:  events.EVENT_STATUS_NACK,
	// 		Message: "Invalid queue event subtype",
	// 	})

	// }
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
