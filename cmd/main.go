package main

import (
	"log"

	"enversonconfig/internal/server"
)

func main() {
	if err := server.Run(); err != nil {
		log.Fatalln(err.Error())
	}
}
