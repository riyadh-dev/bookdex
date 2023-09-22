package middleware

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/storage"
)

type Auth struct {
	env          *config.Env
	booksStorage *storage.Books
}

func newAuth(env *config.Env, booksStorage *storage.Books) *Auth {
	return &Auth{env: env, booksStorage: booksStorage}
}

func (a *Auth) IsAuth() func(*fiber.Ctx) error {
	return jwtware.New(jwtware.Config{
		SigningKey:   jwtware.SigningKey{Key: []byte(a.env.JWT_SECRET)},
		ErrorHandler: jwtError,
		TokenLookup:  "cookie:JWT",
	})
}

func (a *Auth) IsBookOwner() func(*fiber.Ctx) error {
	return jwtware.New(jwtware.Config{
		SigningKey:   jwtware.SigningKey{Key: []byte(a.env.JWT_SECRET)},
		ErrorHandler: jwtError,
		TokenLookup:  "cookie:JWT",
		SuccessHandler: func(ctx *fiber.Ctx) error {
			bookId := ctx.Params("id")
			userId := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)["userId"].(string)

			book, err := a.booksStorage.GetById(bookId)
			if err != nil {
				return fiber.ErrInternalServerError
			}

			if book.SubmitterID.Hex() != userId {
				return fiber.ErrUnauthorized
			}

			return ctx.Next()
		},
	})
}

func jwtError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(
			fiber.Map{
				"status":  "error",
				"message": "Missing or malformed JWT",
				"data":    nil,
			},
		)

	} else {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{"status": "error", "message": "Invalid or expired JWT", "data": nil})
	}
}
