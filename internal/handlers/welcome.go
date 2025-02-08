package handlers

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
)

func Welcome(c *fiber.Ctx) error {
	cookies := c.Cookies("auth_token")
	fmt.Println("-------HI-------")
	fmt.Println(cookies)
	return c.Render("welcome", fiber.Map{
		"authToken": cookies,
	}, "layouts/main")
}
