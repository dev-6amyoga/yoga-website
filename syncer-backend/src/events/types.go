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

type TimerVector struct {
	Position     float32 `json:"position"`
	Velocity     float32 `json:"velocity"`
	Acceleration float32 `json:"acceleration"`
	Timestamp    int64   `json:"timestamp"`
}

type EventType string

const (
	EVENT_QUEUE    EventType = "EVENT_QUEUE"
	EVENT_CONTROLS EventType = "EVENT_CONTROLS"
	EVENT_TIMER    EventType = "EVENT_TIMER"
)

type Event struct {
	// objectID string of the class in mongodb
	ClassID string `json:"class_id"`
	UserID  string `json:"user_id"`
	// TODO : accessToken
	Type EventType   `json:"type"`
	Data interface{} `json:"data"`
}

type StudentEventInitRequest struct {
	ClassID   string `json:"class_id"`
	StudentID string `json:"student_id"`
}

type TeacherEventInitRequest struct {
	*TimerVector

	StartPosition float32 `json:"start_position"`
	EndPosition   float32 `json:"end_position"`
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
	Data      interface{}    `json:"data"`
	EventTime string         `json:"event_time"`
}

type QueueEventPushData struct {
	VideoID string `json:"video_id"`
}

type QueueEventPopData struct {
	VideoID string `json:"video_id"`
	Idx     int    `json:"idx"`
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
	Data      interface{}       `json:"-"`
	EventTime string            `json:"event_time"`
}

type ControlsEventSeekToData struct {
	Time float32 `json:"time"`
}

type ControlsEventSeekMarkerData struct {
	Marker int32 `json:"marker"`
}

// ----------------------------------------------------------

const (
	EVENT_TIMER_UPDATE EventType = "EVENT_TIMER_UPDATE"
	EVENT_TIMER_QUERY  EventType = "EVENT_TIMER_QUERY"

	EVENT_TIMER_TIMEUPDATE EventType = "EVENT_TIMER_TIMEUPDATE"
	EVENT_TIMER_CHANGE     EventType = "EVENT_TIMER_CHANGE"
)

type TimerEvent struct {
	// EventTime string `json:"event_time"`
}

type TimerEventUpdateData struct {
	*TimerEvent
	*TimerVector
}

type TimerEventUpdateResponse struct {
	Status EventStatus `json:"status"`
}

type TimerEventQueryData struct {
	*TimerEvent
}

type TimerEventResponse struct {
	Type   EventType   `json:"type"`
	Status EventStatus `json:"status"`
	Data   interface{} `json:"data"`
}

// ----------------------------------------------------------
type EventStatus string

const (
	EVENT_STATUS_ACK  EventStatus = "EVENT_STATUS_ACK"
	EVENT_STATUS_NACK EventStatus = "EVENT_STATUS_NACK"
)

type EventStudentResponse struct {
	Status      EventStatus  `json:"status"`
	Message     string       `json:"message"`
	QueueEvents []QueueEvent `json:"queue_events"`
}

type EventTeacherResponse struct {
	Status  EventStatus `json:"status"`
	Message string      `json:"message"`
}
