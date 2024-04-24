package server

import (
	"net"

	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

type Server struct {
	// socker server instance
	socketGroups map[string][]net.Conn

	// db
	dbClient *mongo.Client

	// logger
	logger *zap.SugaredLogger
}
