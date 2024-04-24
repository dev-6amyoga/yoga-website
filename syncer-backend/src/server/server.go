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
}
