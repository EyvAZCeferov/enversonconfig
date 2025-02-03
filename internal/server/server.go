package server

import (
	"flag"
    "fmt"
	// "os"
	"time"

	"github.com/EyvAZCeferov/enversonconfig/internal/handlers"
	w "github.com/EyvAZCeferov/enversonconfig/pkg/webrtc"

	"path/filepath"
	"runtime"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/template/html"
	"github.com/gofiber/websocket/v2"
)

var (
	addr = flag.String("addr", ":62947", "")
	cert = flag.String("cert", "", "")
	key  = flag.String("key", "", "")
)

func getPath(page string) string {
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	return filepath.Join(basepath, page)
}


func Run() error {
	flag.Parse()

	if *addr == ":" {
		*addr = ":62947"
	}

	viewsPath := getPath("views")
    fmt.Println("Views Path: ", viewsPath)

	engine := html.New(viewsPath, ".html")

	app := fiber.New(fiber.Config{Views: engine, ProxyHeader: fiber.HeaderXForwardedFor})
	// app := fiber.New()

	app.Use(logger.New())
	// app.Use(cors.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",                                        // Tüm origin'lere izin ver
		AllowMethods:     "GET,POST,PUT,DELETE",                      // İzin verilen HTTP metodları
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization", // İzin verilen header'lar
		AllowCredentials: true,                                       // Cookie ve auth header'larına izin ver
	}))

	app.Get("/", handlers.Welcome)
	app.Get("/room/create", handlers.RoomCreate)
	app.Get("/room/:uuid", handlers.Room)
	app.Get("/room/:uuid/websocket", websocket.New(handlers.RoomWebsocket, websocket.Config{
		HandshakeTimeout: 30 * time.Second, // 10s -> 30s
		ReadBufferSize:   4096,             // Okuma buffer boyutu
		WriteBufferSize:  4096,
	}))
	app.Get("/room/:uuid/chat", handlers.RoomChat)
	app.Get("/room/:uuid/chat/websocket", websocket.New(handlers.RoomChatWebsocket))
	app.Get("/room/:uuid/viewer/websocket", websocket.New(handlers.RoomViewerWebsocket))
	app.Get("/stream/:suuid", handlers.Stream)
	app.Get("/stream/:suuid/websocket", websocket.New(handlers.StreamWebsocket, websocket.Config{
		HandshakeTimeout: 30 * time.Second, // 10s -> 30s
		ReadBufferSize:   4096,             // Okuma buffer boyutu
		WriteBufferSize:  4096,
	}))
	app.Get("/stream/:suuid/chat/websocket", websocket.New(handlers.StreamChatWebsocket))
	app.Get("/stream/:suuid/viewer/websocket", websocket.New(handlers.StreamViewerWebsocket))
	assetPath := getPath("assets")
    fmt.Println("Asset Path: ", assetPath)
	app.Static("/assets", assetPath)

	w.Rooms = make(map[string]*w.Room)
	w.Streams = make(map[string]*w.Room)
	go dispatchKeyFrames()
	if *cert != "" {
		return app.ListenTLS(*addr, *cert, *key)
	}
	return app.Listen(*addr)
}

func dispatchKeyFrames() {
	for range time.NewTicker(time.Second * 3).C {
		for _, room := range w.Rooms {
			room.Peers.DispatchKeyFrame()
		}
	}
}
