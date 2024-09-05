package server

import (
	"syncer-backend/src/events"
	"syncer-backend/src/timer"

	"github.com/puzpuzpuz/xsync"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

type Server struct {
	// socker server instance

	// db
	dbClient *mongo.Client

	// logger
	logger *zap.SugaredLogger

	// timers
	Timers timer.TimerMap

	// update channels map for each classId with a channel for each joinee
	// {classId: {userId: chan float32}}
	UpdateChannels *xsync.MapOf[string, *xsync.MapOf[string, chan events.TimerVector]]
}
