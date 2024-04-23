package server

import (
	"fmt"
	"net"
	"os"

	"go.uber.org/zap"
)

func NewServer() *Server {
	l, err := zap.NewDevelopment()

	prependedLogger := l.Sugar()

	if err != nil {
		panic(err)
	}

	return &Server{
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
