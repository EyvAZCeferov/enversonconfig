package server

import (
	"flag"
	"path/filepath"
	"runtime"

	"encoding/json"
	"fmt"
	"github.com/EyvAZCeferov/enversonconfig/internal/handlers"
	w "github.com/EyvAZCeferov/enversonconfig/pkg/webrtc"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/gofiber/template/html"
	"github.com/gofiber/websocket/v2"
	"io/ioutil"
	"net/http"
	"time"
)

var (
	addr         = flag.String("addr", ":6333", "")
	cert         = flag.String("cert", "", "")
	key          = flag.String("key", "", "")
	sessionStore *session.Store
)

type CookieResponse struct {
	Status string `json:"status"`
	Data   string `json:"data"`
}

func fetchUserCookie() (string, error) {
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	resp, err := client.Get("https://enverson.com/cookies?type=user")
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result CookieResponse
	err = json.Unmarshal(body, &result)
	if err != nil {
		return "", err
	}

	fmt.Println(result)

	if result.Status != "success" {
		return "", fmt.Errorf("invalid status: %s", result.Status)
	}

	return result.Data, nil
}

func getPath(page string) string {
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	return filepath.Join(basepath, page)
}

func setupApp() *fiber.App {
	viewPath := getPath("views")
	fmt.Println(viewPath)
	engine := html.New(viewPath, ".html")
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	assetPath := getPath("public")
	fmt.Println("-----------------ASSETS---------------")
	fmt.Println(assetPath)
	app.Static("/", assetPath)

	return app
}

func Run() error {
	flag.Parse()

	app := setupApp()

	if *addr == ":" {
		*addr = ":6333"
	}

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: false,
	}))

	app.Use(func(c *fiber.Ctx) error {
		if c.Path() == "/login" || c.Path() == "/register" {
			return c.Next()
		}
		ext := filepath.Ext(c.Path())
		if ext == ".css" || ext == ".js" || ext == ".png" || ext == ".jpg" || ext == ".svg" {
			return c.Next()
		}

		cookies := c.Cookies("auth_token")
		if cookies == "" {
			done := make(chan string, 1)
			go func() {
				token, err := fetchUserCookie()
				if err == nil && token != "" {
					done <- token
				} else {
					done <- ""
				}
				close(done)
			}()
			select {
			case token := <-done:
				if token != "" {
					cookie := &fiber.Cookie{
						Name:     "auth_token",
						Value:    token,
						SameSite: "lax",
						Path:     "/",
						// Domain:   ".enverson.com",
						MaxAge: 365 * 24 * 3600,
					}
					c.Cookie(cookie)
					originalPath := c.Path()
					return c.Redirect(originalPath, fiber.StatusMovedPermanently)
				} else {
					return c.Redirect("/login")
				}
			case <-time.After(time.Second * 30):
				return c.Redirect("/login")
			}
		}

		return c.Next()
	})

	app.Get("/login", handlers.Login)
	app.Post("/login", handlers.LoginPostfunc)
	app.Get("/register", handlers.Register)
	app.Get("/", handlers.Welcome)
	app.Get("/room/create", handlers.RoomCreate)
	app.Get("/room/:uuid", handlers.Room)
	app.Get("/room/:uuid/websocket", websocket.New(handlers.RoomWebsocket, websocket.Config{
		HandshakeTimeout: 60 * time.Second,
		ReadBufferSize:   4096,
		WriteBufferSize:  4096,
	}))
	app.Get("/room/:uuid/chat", handlers.RoomChat)
	app.Get("/room/:uuid/chat/websocket", websocket.New(handlers.RoomChatWebsocket))
	app.Get("/room/:uuid/viewer/websocket", websocket.New(handlers.RoomViewerWebsocket))
	app.Get("/stream/:suuid", handlers.Stream)
	app.Get("/stream/:suuid/websocket", websocket.New(handlers.StreamWebsocket, websocket.Config{
		HandshakeTimeout: 60 * time.Second,
		ReadBufferSize:   4096,
		WriteBufferSize:  4096,
	}))
	app.Get("/stream/:suuid/chat/websocket", websocket.New(handlers.StreamChatWebsocket))
	app.Get("/stream/:suuid/viewer/websocket", websocket.New(handlers.StreamViewerWebsocket))

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
