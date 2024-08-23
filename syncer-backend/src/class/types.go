package class

import "syncer-backend/src/events"

type ClassModel struct {
	ID          string `json:"_id"`
	Name        string `json:"class_name"`
	Description string `json:"class_desc"`
	// InstituteID   string                 `json:"institute_id"`
	TeacherID string `json:"teacher_id"`
	// Students      []string               `json:"students"`
	ControlsQueue []events.ControlsEvent `json:"controls_queue"`
	ActionsQueue  []events.QueueEvent    `json:"actions_queue"`
	// WatchHistory  []string               `json:"watch_history"`
}
