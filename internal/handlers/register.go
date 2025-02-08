package handlers

import "github.com/gofiber/fiber/v2"

func Register(c *fiber.Ctx) error {
	cookies := c.Cookies("auth_token")
	if cookies == "" {
		return c.Render("register", nil, "layouts/main")
	} else {
		return c.Redirect("/")
	}
}
