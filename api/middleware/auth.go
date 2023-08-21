package middleware

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/riyadh-dev/bookdex/api/config"
)

type Auth struct {
	env *config.Env
}

func newAuth(env *config.Env) *Auth {
	return &Auth{env: env}
}

func (a *Auth) IsAuth() func(*fiber.Ctx) error {
	return jwtware.New(jwtware.Config{
		SigningKey:   jwtware.SigningKey{Key: []byte(a.env.JWT_SECRET)},
		ErrorHandler: jwtError,
		TokenLookup:  "cookie:jwt",
	})
}

func (a *Auth) IsOwner(paramName string) func(*fiber.Ctx) error {
	return jwtware.New(jwtware.Config{
		SigningKey:   jwtware.SigningKey{Key: []byte(a.env.JWT_SECRET)},
		ErrorHandler: jwtError,
		TokenLookup:  "cookie:jwt",
		SuccessHandler: func(ctx *fiber.Ctx) error {
			//TODO: check if user is owner of the resource
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
