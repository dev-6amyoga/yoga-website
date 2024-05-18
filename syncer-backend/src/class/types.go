package class

import "syncer-backend/src/events"

type ClassModel struct {
	ID            string                 `json:"id"`
	Name          string                 `json:"name"`
	Description   string                 `json:"description"`
	InstituteID   string                 `json:"institute_id"`
	TeacherID     string                 `json:"teacher_id"`
	Students      []string               `json:"students"`
	ControlsQueue []events.ControlsEvent `json:"controls_queue"`
	ActionsQueue  []events.QueueEvent    `json:"actions_queue"`
	WatchHistory  []string               `json:"watch_history"`
}
