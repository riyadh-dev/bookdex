package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/riyadh-dev/go-rest-api-demo/api/handlers"
)

func AddBookRouter(app fiber.Router) {
	router := app.Group("/books")

	router.Get("/", handlers.GetBooks)
	router.Get("/:id", handlers.GetBook)
	router.Post("/", handlers.CreateBook)
	router.Put("/:id", handlers.UpdateBook)
	router.Delete("/:id", handlers.DeleteBook)
}
