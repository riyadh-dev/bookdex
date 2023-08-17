package server

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/handlers"
	"go.uber.org/fx"
)

var FxModule = fx.Options(
	fx.Provide(newFiberApp),
	fx.Invoke(registerHandlers, initServer),
)

func newFiberApp(lifecycle fx.Lifecycle) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(logger.New())
	app.Use(recover.New())

	return app
}

func registerHandlers(app *fiber.App, booksHandlers *handlers.Books) {
	api := app.Group("/api")

	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Heath Check OK")
	})

	booksRouter := api.Group("/books")
	booksRouter.Post("/", booksHandlers.CreateBook)
	booksRouter.Get("/", booksHandlers.GetBooks)
	booksRouter.Get("/:id", booksHandlers.GetBook)
	booksRouter.Put("/:id", booksHandlers.UpdateBook)
	booksRouter.Delete("/:id", booksHandlers.DeleteBook)
}

func initServer(lifecycle fx.Lifecycle, app *fiber.App, env *config.Env) {
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
