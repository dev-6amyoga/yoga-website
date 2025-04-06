package wssyncer

import (
	"net/http"
	"syncer-backend/src/models"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewServer() models.ServerInterface {
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

	prependedLogger.Info("Successfully connected to MongoDB")

	return &WsServer{}
}

func (s *WsServer) Start() error {
	log := zap.S()
	// start socket server

	// serve
	http.HandleFunc("/teacher/ws", s.Endpoints.HandleTeacherConnection)
	http.HandleFunc("/student/ws", s.Endpoints.HandleStudentConnection)

	log.Debugf("HTTP server for WebSocket started at port 4949")
	err := http.ListenAndServe(":4949", nil)

	if err != nil {
		log.Errorf("Error starting HTTP server: %s", err)
		return err
	}

	return nil
}
