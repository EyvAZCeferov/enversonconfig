package handlers

import (
	"bytes"
	"encoding/json"
	// "fmt"
	"github.com/gofiber/fiber/v2"
	"net/http"
	"time"
)

type LoginResponse struct {
	Status  string    `json:"status"`
	Data    LoginData `json:"data"`
	Message string    `json:"message"`
	Token   string    `json:"token"`
}

type LoginData struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	User_type string `json:"user_type"`
}

func Login(c *fiber.Ctx) error {
	cookies := c.Cookies("auth_token")
	if cookies == "" {
		return c.Render("login", nil, "layouts/main")
	} else {
		return c.Redirect("/")
	}
}

func LoginPostfunc(c *fiber.Ctx) error {
	var loginData struct {
		Email    string `form:"email"`
		Password string `form:"password"`
	}

	err := c.BodyParser(&loginData)
	if err != nil {
		return c.SendStatus(http.StatusBadRequest)
	}

	if loginData.Email == "" || loginData.Password == "" {
		return c.SendStatus(http.StatusBadRequest)
	}

	requestBody := map[string]string{
		"email":    loginData.Email,
		"password": loginData.Password,
		"type":     "login",
	}

	response, err := sendAnotherServer("https://enverson.com/api/auth", requestBody)
	if err != nil {
		return c.SendStatus(http.StatusInternalServerError)
	}

	defer response.Body.Close()

	var loginResp LoginResponse
	err = json.NewDecoder(response.Body).Decode(&loginResp)
	if err != nil {
		return c.SendStatus(http.StatusInternalServerError)
	}

	if response.StatusCode != http.StatusOK {
		return c.Render("login", fiber.Map{
			"message": "Giriş uğursuz",
		})
	}

	cookie := &fiber.Cookie{
		Name:  "auth_token",
		Value: loginResp.Token,
		// Secure:   true,
		// HTTPOnly: true,
		SameSite: "lax",
		Path:     "/",
		// Domain:   ".enverson.com",
		MaxAge: 365 * 24 * 3600,
	}

	c.Cookie(cookie)

	return c.Redirect("/", 302)
}

func sendAnotherServer(endpoint string, requestBody map[string]string) (*http.Response, error) {
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	requestBodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	return res, nil
}
