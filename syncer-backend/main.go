package main

import "syncer-backend/src/server"

func main() {
	server := server.NewServer()
	err := server.Start()

	if err != nil {
		panic(err)
	}
}
