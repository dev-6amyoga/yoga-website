package server

import (
	"net/http"
	"syncer-backend/src/events"
	"syncer-backend/src/timer"

	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/puzpuzpuz/xsync"
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

	timers := timer.NewTimerMap()
	// timers

	// mongo connector
	// bsonOpts := &options.BSONOptions{
	// 	UseJSONStructTags: true,
	// 	NilSliceAsEmpty:   true,
	// }

	// client, err := mongo.Connect(
	// 	context.Background(),
	// 	options.Client().ApplyURI(os.Getenv("DB_URL")).SetBSONOptions(bsonOpts),
	// )

	// if err != nil {
	// 	prependedLogger.Errorf("Error connecting to MongoDB: %s", err)
	// 	panic(err)
	// }

	// Check if the connection was successful
	// err = client.Ping(context.Background(), nil)
	// if err != nil {
	// 	prependedLogger.Errorf("Error pinging MongoDB: %s", err)
	// 	panic(err)
	// }

	prependedLogger.Info("Successfully connected to MongoDB")

	return &Server{
		dbClient:       nil,
		logger:         prependedLogger,
		Timers:         timers,
		UpdateChannels: xsync.NewMapOf[*xsync.MapOf[string, chan events.TimerEventResponse]](),
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

func (s *Server) TickerHandler(classId string, t *timer.Timer) {
	// TODO : make done part work where position > endPosition

	chans, ok := s.UpdateChannels.Load(classId)

	if !ok {
		return
	}

	for {
		select {
		case <-t.Done:
			return
		case tic := <-t.Ticker.C:
			// fmt.Println("Tick at", tic)

			ticToInt := tic.UnixMilli() - t.LastUpdated

			chans.Range(func(key string, value chan events.TimerEventResponse) bool {
				value <- events.TimerEventResponse{
					Type:   events.EVENT_TIMER_TIMEUPDATE,
					Status: events.EVENT_STATUS_ACK,
					Data: events.TimerVector{
						Position:     timer.CalculatePosition(t.StartPosition, ticToInt, t.Velocity, t.Acceleration),
						Velocity:     t.Velocity,
						Acceleration: t.Acceleration,
						Timestamp:    tic.UnixMilli(),
					},
				}

				return true
			})

		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
