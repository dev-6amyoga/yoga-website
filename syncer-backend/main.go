package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"syncer-backend/src/server"
)


func main() {
	server := server.NewServer()
	server.Start()

	url := "http://localhost:4000/content/video/getAllTransitions"
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("Error creating GET request:", err)
		return
	}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making GET request:", err)
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}
	fmt.Println("Response Body:", string(body))
}