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

func newFiberApp(lifecycle fx.Lifecycle /*env *config.Env*/) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(logger.New())
	app.Use(recover.New())

	//not working currently
	/*app.Use(encryptcookie.New(encryptcookie.Config{
		Key: "secret-thirty-2-character-string",
	}))*/

	return app
}

func registerHandlers(
	app *fiber.App,
	booksHandlers *handlers.Books,
	authHandlers *handlers.Auth,
	//authMiddleware *middleware.Auth,
) {
	api := app.Group("/api")

	api.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.SendString("Heath Check OK")
	})

	authRouter := api.Group("/auth")
	authRouter.Post("/sign-up", authHandlers.SignUp)
	authRouter.Post("/sign-in", authHandlers.SignIn)

	booksRouter := api.Group("/books")
	booksRouter.Post("/", booksHandlers.Create)
	booksRouter.Get("/", booksHandlers.GetAll)
	booksRouter.Get("/:id", booksHandlers.GetById)
	booksRouter.Put("/:id", booksHandlers.Update)
	booksRouter.Delete("/:id", booksHandlers.Delete)
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
