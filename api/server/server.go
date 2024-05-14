package server

import (
	"context"
	"time"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/encryptcookie"
	"github.com/gofiber/fiber/v2/middleware/limiter"
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
	ratingsHandlers *handlers.Ratings,
) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(logger.New())
	app.Use(limiter.New(limiter.Config{
		Max:        20,
		Expiration: 30 * time.Second,
		LimitReached: func(ctx *fiber.Ctx) error {
			return ctx.SendString("Too many requests, please wait a minute")
		},
	}))
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

	usersRouter := api.Group("/users")
	usersRouter.Get("/mocked", usersHandlers.GetAllMocked)
	usersRouter.Patch("/:id", authMiddleware.Protected(), usersHandlers.Update)

	booksRouter := api.Group("/books")
	booksRouter.Post("/", authMiddleware.Protected(), booksHandlers.Create)
	booksRouter.Get("/", booksHandlers.GetAll)
	booksRouter.Get(
		"/bookmarked",
		authMiddleware.Protected(),
		booksHandlers.GetAllBookmarked,
	)
	booksRouter.Get("/submitter/:id", booksHandlers.GetAllBySubmitterId)
	booksRouter.Get("/:id", booksHandlers.GetById)
	booksRouter.Patch(
		"/:id",
		authMiddleware.Protected(),
		authMiddleware.IsBookOwner(),
		booksHandlers.Update,
	)
	booksRouter.Delete("/:id", authMiddleware.Protected(), booksHandlers.Delete)

	booksRouter.Patch(
		"/:id/bookmark",
		authMiddleware.Protected(),
		booksHandlers.Bookmark,
	)
	booksRouter.Patch(
		"/:id/unbookmark",
		authMiddleware.Protected(),
		booksHandlers.Unbookmark,
	)
	booksRouter.Post(
		"/:id/comments",
		authMiddleware.Protected(),
		commentsHandlers.Create,
	)
	booksRouter.Patch(
		"/:id/comments",
		authMiddleware.Protected(),
		commentsHandlers.Update,
	)
	booksRouter.Get(
		"/:id/comments",
		commentsHandlers.GetAllByBookId,
	)
	booksRouter.Post(
		"/:id/ratings",
		authMiddleware.Protected(),
		ratingsHandlers.Create,
	)
	booksRouter.Patch(
		"/:id/ratings",
		authMiddleware.Protected(),
		ratingsHandlers.Update,
	)
	booksRouter.Get(
		"/:id/ratings",
		authMiddleware.Protected(),
		ratingsHandlers.GetByBookIdAndRaterId,
	)
	booksRouter.Delete(
		"/:id/ratings",
		authMiddleware.Protected(),
		ratingsHandlers.Delete,
	)

	commentsRouter := api.Group("/comments")
	commentsRouter.Patch(
		"/:id",
		authMiddleware.Protected(),
		commentsHandlers.Update,
	)
	commentsRouter.Delete(
		"/:id",
		authMiddleware.Protected(),
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
