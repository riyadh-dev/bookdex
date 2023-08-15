package main

import (
	"log"
	"rest-api/api/routes"
	"rest-api/database"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	err := initApp()
	if err != nil {
		panic(err)
	}

	defer database.DisconnectDB()

	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})
	app.Use(recover.New())

	api := app.Group("/api")
	routes.BookRouter(api)

	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Listen(":3000")
}

func loadEnv() error {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}
	return err
}

func initApp() error {
	err := loadEnv()
	if err != nil {
		return err
	}

	err = database.ConnectDB()
	if err != nil {
		return err
	}

	return nil
}
