package server

import "go.uber.org/zap"
import "go.mongodb.org/mongo-driver/mongo"

type Server struct {
	// socker server instance

	// db
	dbClient *mongo.Client

	// logger
	logger *zap.SugaredLogger
}
