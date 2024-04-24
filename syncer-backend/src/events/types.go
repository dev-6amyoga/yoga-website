package events

// Event types

/*
Example :
{
	type: "EVENT_QUEUE",
	data: {
		subtype: "EVENT_QUEUE_ADD",
		data: {}
	}
}
*/

type EventType string

const (
	EVENT_QUEUE    EventType = "EVENT_QUEUE"
	EVENT_CONTROLS EventType = "EVENT_CONTROLS"
)

type Event struct {
	Type EventType `json:"type"`
	Data struct{}  `json:"data"`
}

type QueueEventType string

const (
	EVENT_QUEUE_ADD QueueEventType = "EVENT_QUEUE_ADD"
	EVENT_QUEUE_POP QueueEventType = "EVENT_QUEUE_POP"
)

type QueueEvent struct {
	SubType QueueEventType `json:"subtype"`
	Data    struct{}       `json:"data"`
}

type ControlsEventType string

const (
	EVENT_CONTROLS_PLAY        ControlsEventType = "EVENT_CONTROLS_PLAY"
	EVENT_CONTROLS_PAUSE       ControlsEventType = "EVENT_CONTROLS_PAUSE"
	EVENT_CONTROLS_VOLUME      ControlsEventType = "EVENT_CONTROLS_VOLUME"
	EVENT_CONTROLS_SEEK_TO     ControlsEventType = "EVENT_CONTROLS_SEEK_TO"
	EVENT_CONTROLS_SEEK_MARKER ControlsEventType = "EVENT_CONTROLS_SEEK_MARKER"
	EVENT_CONTROLS_LOOP        ControlsEventType = "EVENT_CONTROLS_LOOP"
	EVENT_CONTROLS_NEXT        ControlsEventType = "EVENT_CONTROLS_NEXT"
	EVENT_CONTROLS_PREV        ControlsEventType = "EVENT_CONTROLS_PREV"
)

type ControlsEvent struct {
	SubType ControlsEventType `json:"subtype"`
	Data    struct{}          `json:"data"`
}

type EventStatus string

const (
	EVENT_STATUS_ACK  EventStatus = "EVENT_STATUS_ACK"
	EVENT_STATUS_NACK EventStatus = "EVENT_STATUS_NACK"
)

type EventACK struct {
	Status EventStatus `json:"status"`
}

var (
	EVENT_ACK  = EventACK{Status: EVENT_STATUS_ACK}
	EVENT_NACK = EventACK{Status: EVENT_STATUS_NACK}
)
