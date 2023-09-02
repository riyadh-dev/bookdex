package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"github.com/riyadh-dev/bookdex/api/storage"
	"golang.org/x/crypto/bcrypt"
)

type Auth struct {
	env          *config.Env
	validator    *config.Validator
	usersStorage *storage.Users
}

func newAuth(
	env *config.Env,
	validator *config.Validator,
	usersStorage *storage.Users,
) *Auth {
	return &Auth{
		env:          env,
		validator:    validator,
		usersStorage: usersStorage,
	}
}

func (a *Auth) SignUp(ctx *fiber.Ctx) error {
	var requestBody models.InsertUserInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = a.validator.Validate(&requestBody)
	if err != nil {
		return &fiber.Error{
			Code:    fiber.ErrBadRequest.Code,
			Message: err.Error(),
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(requestBody.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	requestBody.Password = string(hashedPassword)
	id, err := a.usersStorage.Create(&requestBody)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.Map{
		"id": id,
	})
}

func (a *Auth) SignIn(ctx *fiber.Ctx) error {
	var requestBody models.SignInInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = a.validator.Validate(&requestBody)
	if err != nil {
		return &fiber.Error{
			Code:    fiber.ErrBadRequest.Code,
			Message: err.Error(),
		}
	}

	user, err := a.usersStorage.GetByEmail(requestBody.Email)
	if err != nil {
		return fiber.ErrNotFound
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(requestBody.Password),
	)
	if err != nil {
		return fiber.ErrUnauthorized
	}

	expirationTime := time.Now().
		Add(time.Hour * time.Duration(a.env.AUTH_EXP_HOUR))

	claims := &models.JWTClaims{
		UserID: user.ID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	tokenString, err := token.SignedString([]byte(a.env.JWT_SECRET))
	if err != nil {
		return ctx.SendStatus(fiber.StatusInternalServerError)
	}

	ctx.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		HTTPOnly: true,
		SameSite: "Strict",
		Expires:  expirationTime,
		Secure:   a.env.IS_PROD,
	})

	return ctx.JSON(fiber.Map{
		"id":       user.ID.Hex(),
		"username": user.Username,
		"exp":      expirationTime.Unix(),
	})
}
