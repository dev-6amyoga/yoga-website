package server

import (
    "go.uber.org/zap"
    "go.mongodb.org/mongo-driver/mongo"
    "net" 
)


type Server struct {
	// socker server instance
	socketGroups map[string][]net.Conn 
	
	// db
	dbClient *mongo.Client

	// logger
	logger *zap.SugaredLogger
}
