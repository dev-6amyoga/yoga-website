package models

import (
	"net/http"
	"syncer-backend/src/events"
	"syncer-backend/src/timer"
)

type ServerInterface interface {
	Start() error
}

type EndpointInterface interface {
	HandleTeacherConnection(w http.ResponseWriter, r *http.Request)
	HandleStudentConnection(w http.ResponseWriter, r *http.Request)
	TickerHandler(classID string, t *timer.Timer)
}

type DaoInterface interface {
	AddToActionsQueue(classID string, action *events.QueueEvent) error
}
