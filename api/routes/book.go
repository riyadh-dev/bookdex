package routes

import (
	"rest-api/api/handlers"

	"github.com/gofiber/fiber/v2"
)

func BookRouter(app fiber.Router) {
	router := app.Group("/books")

	router.Get("/", handlers.GetBooks)
	router.Get("/:id", handlers.GetBook)
	router.Post("/", handlers.CreateBook)
	router.Put("/:id", handlers.UpdateBook)
	router.Delete("/:id", handlers.DeleteBook)
}
