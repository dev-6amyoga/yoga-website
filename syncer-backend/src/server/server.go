package server

import (
	"fmt"
	"net"
	"os"
	"time"
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
    "github.com/gorilla/websocket"
    "github.com/google/uuid"  
)

func NewServer() *Server {
	l, err := zap.NewDevelopment()

	prependedLogger := l.Sugar()

	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb+srv://smriti030202:pass,123@yogawebsite.lxvodui.mongodb.net/YogaWebsite"))

	if err != nil {
		panic(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		prependedLogger.Errorf("Error connecting to MongoDB: %s", err)
		panic(err) 
	}

	// Check if the connection was successful
	err = client.Ping(ctx, nil)
	if err != nil {
		prependedLogger.Errorf("Error pinging MongoDB: %s", err)
		panic(err) 
	}

	prependedLogger.Info("Successfully connected to MongoDB")

	return &Server{
		dbClient: client,
		logger: prependedLogger,
	}
}

func (s *Server) Start() {
	// start socket server
	s.logger.Info("Server started at port ----")

	// serve
	tcpServer, err := net.Listen("tcp", ":9209")

	if err != nil {
		s.logger.Error("Error starting server")
		panic(err)
	}
	for {
		connection, err := tcpServer.Accept()

		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
			os.Exit(1)
		}

		fmt.Println("client connected")

		go s.handleConnection(connection)
	}

	http.HandleFunc("/ws", s.handleWebSocket) 
    go http.ListenAndServe(":8080", nil) // Example: Port 8080
    s.logger.Info("HTTP server for WebSocket started at port 8080")  

}

var upgrader = websocket.Upgrader{} 

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil) 
    if err != nil {
        s.logger.Error("Error upgrading to WebSocket:", err)
        return
    }
    defer conn.Close() 

    urlID := r.URL.Query().Get("url") 
    if urlID == "" {
        return
    }
    s.socketGroups[urlID] = append(s.socketGroups[urlID], conn) 
    s.logger.Infof("Client joined URL group: %s", urlID)

	for {
        _, message, err := conn.ReadMessage()
        if err != nil {
            break 
        }
        s.broadcastToGroup(urlID, message)
    }

}

func (s *Server) broadcastToGroup(urlID string, message []byte) {
    group := s.socketGroups[urlID]
    for _, conn := range group {
        if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
            panic(err)
        }
    }
}
