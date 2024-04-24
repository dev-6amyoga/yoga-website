package server

import (
	"context"
	"net/http"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

func NewServer() *Server {
	l, err := zap.NewDevelopment()

	if err != nil {
		panic(err)
	}

	prependedLogger := l.Sugar()

	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI("mongodb+srv://smriti030202:pass,123@yogawebsite.lxvodui.mongodb.net/YogaWebsite"),
	)

	if err != nil {
		panic(err)
	}

	if err != nil {
		prependedLogger.Errorf("Error connecting to MongoDB: %s", err)
		panic(err)
	}

	// Check if the connection was successful
	err = client.Ping(context.Background(), nil)
	if err != nil {
		prependedLogger.Errorf("Error pinging MongoDB: %s", err)
		panic(err)
	}

	prependedLogger.Info("Successfully connected to MongoDB")

	return &Server{
		dbClient: client,
		logger:   prependedLogger,
	}
}

func (s *Server) Start() {
	// start socket server
	s.logger.Info("Server started at port ----")

	// serve
	http.HandleFunc("/teacher/ws", s.handleTeacherConnection)
	http.HandleFunc("/student/ws", s.handleStudentConnection)

	go http.ListenAndServe(":8080", nil) // Example: Port 8080

	s.logger.Info("HTTP server for WebSocket started at port 8080")
}

var upgrader = websocket.Upgrader{}
