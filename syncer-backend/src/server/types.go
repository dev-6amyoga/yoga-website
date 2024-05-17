package server

import (
	"syncer-backend/src/timer"

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
	timers timer.TimerMap
}
