package main

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/database"
	"github.com/riyadh-dev/go-rest-api-demo/handlers"
	"go.uber.org/fx"
)

func main() {
	fx.New(
		fx.Provide(
			config.NewEnv,
			database.NewDBConnection,
			handlers.NewBooks,
			NewFiberApp,
		),
		fx.Invoke(InitServer, RegisterHandlers),
	).Run()
}

func NewFiberApp(lifecycle fx.Lifecycle) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(logger.New())
	app.Use(recover.New())

	return app
}

func RegisterHandlers(app *fiber.App, booksHandlers *handlers.Books) {
	api := app.Group("/api")

	api.Get("/api", func(c *fiber.Ctx) error {
		return c.SendString("Heath Check OK")
	})

	booksRouter := api.Group("/books")
	booksRouter.Post("/", booksHandlers.CreateBook)
	booksRouter.Get("/", booksHandlers.GetBooks)
	booksRouter.Get("/:id", booksHandlers.GetBook)
	booksRouter.Put("/:id", booksHandlers.UpdateBook)
	booksRouter.Delete("/:id", booksHandlers.DeleteBook)
}

func InitServer(lifecycle fx.Lifecycle, app *fiber.App, env *config.Env) {
	lifecycle.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go app.Listen(":" + env.PORT)
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return app.Shutdown()
		},
	})
}
