package main

import (
	wssyncer "syncer-backend/src/server/ws"
)

func main() {
	server := wssyncer.NewServer()
	err := server.Start()

	if err != nil {
		panic(err)
	}
}
