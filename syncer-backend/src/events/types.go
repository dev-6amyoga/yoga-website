package events

// Event types

/*
Queue Event Types
- EVENT_QUEUE_PUSH
- EVENT_QUEUE_POP
- EVENT_QUEUE_CLEAR

*/

/*
Example :
{
	type: "EVENT_QUEUE",
	data: {
		subtype: "EVENT_QUEUE_PUSH",
		data: {}
	},
}
*/

type EventType string

const (
	EVENT_QUEUE    EventType = "EVENT_QUEUE"
	EVENT_CONTROLS EventType = "EVENT_CONTROLS"
	EVENT_TIMER    EventType = "EVENT_TIMER"
)

type Event struct {
	// objectID string of the class in mongodb
	ClassID string    `json:"class_id"`
	Type    EventType `json:"type"`
	Data    struct{}  `json:"data"`
}

// ----------------------------------------------------------
type QueueEventType string

const (
	EVENT_QUEUE_PUSH  QueueEventType = "EVENT_QUEUE_PUSH"
	EVENT_QUEUE_POP   QueueEventType = "EVENT_QUEUE_POP"
	EVENT_QUEUE_CLEAR QueueEventType = "EVENT_QUEUE_CLEAR"
)

type QueueEvent struct {
	SubType   QueueEventType `json:"subtype"`
	Data      struct{}       `json:"data"`
	EventTime string         `json:"event_time"`
}

// ----------------------------------------------------------
type ControlsEventType string

const (
	EVENT_CONTROLS_PLAY        ControlsEventType = "EVENT_CONTROLS_PLAY"
	EVENT_CONTROLS_PAUSE       ControlsEventType = "EVENT_CONTROLS_PAUSE"
	EVENT_CONTROLS_NEXT        ControlsEventType = "EVENT_CONTROLS_NEXT"
	EVENT_CONTROLS_PREV        ControlsEventType = "EVENT_CONTROLS_PREV"
	EVENT_CONTROLS_SEEK_TO     ControlsEventType = "EVENT_CONTROLS_SEEK_TO"
	EVENT_CONTROLS_SEEK_MARKER ControlsEventType = "EVENT_CONTROLS_SEEK_MARKER"
)

type ControlsEvent struct {
	SubType   ControlsEventType `json:"subtype"`
	Data      struct{}          `json:"data"`
	EventTime string            `json:"event_time"`
}

// ----------------------------------------------------------

type TimerEvent struct {
	CurrentTime float32 `json:"current_time"`
	EventTime   string  `json:"event_time"`
}

// ----------------------------------------------------------
type EventStatus string

const (
	EVENT_STATUS_ACK  EventStatus = "EVENT_STATUS_ACK"
	EVENT_STATUS_NACK EventStatus = "EVENT_STATUS_NACK"
)

type EventStudentResponse struct {
	Status EventStatus `json:"status"`
	Data   []Event     `json:"data"`
}

type EventTeacherResponse struct {
	Status  EventStatus `json:"status"`
	Message string      `json:"message"`
}
