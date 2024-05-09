package server

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/encryptcookie"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/handlers"
	"github.com/riyadh-dev/bookdex/api/middleware"
	"go.uber.org/fx"
)

var FxModule = fx.Options(
	fx.Provide(newFiberApp),
	fx.Invoke(initServer),
)

func newFiberApp(
	lifecycle fx.Lifecycle,
	env *config.Env,
	usersHandlers *handlers.Users,
	booksHandlers *handlers.Books,
	authHandlers *handlers.Auth,
	authMiddleware *middleware.Auth,
	commentsHandlers *handlers.Comments,
) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(logger.New())
	//app.Use(limiter.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     env.CLIENT_URL,
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))
	app.Use(encryptcookie.New(encryptcookie.Config{
		Key: env.COOKIE_SECRET,
	}))

	api := app.Group("/api")

	api.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.SendString("Heath Check OK")
	})

	authRouter := api.Group("/auth")
	authRouter.Post("/sign-up", authHandlers.SignUp)
	authRouter.Post("/sign-in", authHandlers.SignIn)
	authRouter.Delete("/sign-out", authHandlers.SignOut)

	usersRouter := api.Group("/users")
	usersRouter.Patch("/:id", authMiddleware.IsAuth(), usersHandlers.Update)

	booksRouter := api.Group("/books")
	booksRouter.Post("/", authMiddleware.IsAuth(), booksHandlers.Create)
	booksRouter.Get("/", booksHandlers.GetAll)
	booksRouter.Get(
		"/bookmarked",
		authMiddleware.IsAuth(),
		booksHandlers.GetAllBookmarked,
	)
	booksRouter.Get("/author/:id", booksHandlers.GetBySubmitterId)
	booksRouter.Get("/:id", booksHandlers.GetById)
	booksRouter.Patch(
		"/:id",
		authMiddleware.IsAuth(),
		authMiddleware.IsBookOwner(),
		booksHandlers.Update,
	)
	booksRouter.Delete("/:id", authMiddleware.IsAuth(), booksHandlers.Delete)

	booksRouter.Patch(
		"/:id/bookmark",
		authMiddleware.IsAuth(),
		booksHandlers.Bookmark,
	)
	booksRouter.Patch(
		"/:id/unbookmark",
		authMiddleware.IsAuth(),
		booksHandlers.Unbookmark,
	)
	booksRouter.Post(
		"/:id/comments",
		authMiddleware.IsAuth(),
		commentsHandlers.Create,
	)
	booksRouter.Patch(
		"/:id/comments",
		authMiddleware.IsAuth(),
		commentsHandlers.Update,
	)
	booksRouter.Get(
		"/:id/comments",
		commentsHandlers.GetAllByBookId,
	)

	commentsRouter := api.Group("/comments")
	commentsRouter.Patch("/:id", authMiddleware.IsAuth(), commentsHandlers.Update)
	commentsRouter.Delete(
		"/:id",
		authMiddleware.IsAuth(),
		commentsHandlers.Delete,
	)

	return app
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
