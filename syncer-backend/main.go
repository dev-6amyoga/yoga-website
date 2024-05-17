package main

import "time"

func main() {
	// server := server.NewServer()
	// server.Start()
	t := "2024-05-17T18:03:53.025Z"

	to, err := time.Parse(time.RFC3339, t)

	if err != nil {
		panic(err)
	}

	println(to.Unix(), to.GoString())
}
