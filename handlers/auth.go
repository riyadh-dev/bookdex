package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/models"
	"github.com/riyadh-dev/go-rest-api-demo/storage"
	"golang.org/x/crypto/bcrypt"
)

type Auth struct {
	env          *config.Env
	usersStorage *storage.Users
}

func newAuth(env *config.Env, usersStorage *storage.Users) *Auth {
	return &Auth{
		env:          env,
		usersStorage: usersStorage,
	}
}

func (a *Auth) SignUp(ctx *fiber.Ctx) error {
	var requestBody models.InsertUserInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(requestBody.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	id, err := a.usersStorage.Create(&models.InsertUserInput{
		Username: requestBody.Username,
		Password: string(hashedPassword),
	})
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.Map{
		"id": id,
	})
}

func (a *Auth) SignIn(ctx *fiber.Ctx) error {
	var requestBody models.InsertUserInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	user, err := a.usersStorage.GetByUsername(requestBody.Username)
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
		Expires:  expirationTime,
		//Secure:   true,
	})

	return ctx.JSON(fiber.Map{
		"id":       user.ID.Hex(),
		"username": user.Username,
	})
}
