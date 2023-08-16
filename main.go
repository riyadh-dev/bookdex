package main

import (
	"os"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/riyadh-dev/go-rest-api-demo/api/routes"
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/database"
)

func main() {
	err := run()
	if err != nil {
		panic(err)
	}

}

func run() error {
	err := config.LoadEnv()
	if err != nil {
		return err
	}

	err = database.ConnectDB()
	if err != nil {
		return err
	}

	defer database.DisconnectDB()

	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(logger.New())
	app.Use(recover.New())

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	api := app.Group("/api")
	routes.AddBookRouter(api)

	app.Listen(":" + os.Getenv("PORT"))

	return nil
}
