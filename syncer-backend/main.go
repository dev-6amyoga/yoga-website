package main

import "syncer-backend/src/server"

func main() {
	server := server.NewServer()
	server.Start()
}
