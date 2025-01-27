package main

import (
	"log"

	"github.com/EyvAZCeferov/enversonconfig/internal/server"
)

func main() {
	if err := server.Run(); err != nil {
		log.Fatalln(err.Error())
	}
}
