package server

import (
	"context"
	"net/http"
	"os"
	"syncer-backend/src/timer"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/puzpuzpuz/xsync"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

func NewServer() *Server {
	// read env vars
	err := godotenv.Load(".env")

	if err != nil {
		panic(err)
	}

	// logger
	l, err := zap.NewDevelopment()

	if err != nil {
		panic(err)
	}

	prependedLogger := l.Sugar()

	// timers
	timers := timer.NewTimerMap()

	// mongo connector
	bsonOpts := &options.BSONOptions{
		UseJSONStructTags: true,
		NilSliceAsEmpty:   true,
	}

	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI(os.Getenv("DB_URL")).SetBSONOptions(bsonOpts),
	)

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
		dbClient:       client,
		logger:         prependedLogger,
		Timers:         timers,
		UpdateChannels: xsync.NewMapOf[[]chan float64](),
	}
}

func (s *Server) Start() {
	// start socket server

	// serve
	http.HandleFunc("/teacher/ws", s.handleTeacherConnection)
	http.HandleFunc("/student/ws", s.handleStudentConnection)

	s.logger.Info("HTTP server for WebSocket started at port 4949")
	http.ListenAndServe(":4949", nil)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
