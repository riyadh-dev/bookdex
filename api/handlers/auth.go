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
	customErrors *config.CustomErrors
}

func newAuth(
	env *config.Env,
	validator *config.Validator,
	usersStorage *storage.Users,
	customErrors *config.CustomErrors,
) *Auth {
	return &Auth{
		env:          env,
		validator:    validator,
		usersStorage: usersStorage,
		customErrors: customErrors,
	}
}

func (a *Auth) SignUp(ctx *fiber.Ctx) error {
	requestBody := new(models.InsertUserInput)
	err := ctx.BodyParser(requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = a.validator.Validate(requestBody)
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
	id, err := a.usersStorage.Create(requestBody)
	if err != nil {
		if err == a.customErrors.ErrDuplicateKey {
			return fiber.ErrConflict
		}
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.Map{"id": id})
}

func (a *Auth) SignIn(ctx *fiber.Ctx) error {
	requestBody := new(models.SignInInput)
	err := ctx.BodyParser(requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = a.validator.Validate(requestBody)
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

	token := jwt.New(jwt.SigningMethodHS256)

	exp := time.Now().Add(time.Hour * 72).Unix()

	claims := token.Claims.(jwt.MapClaims)
	claims["id"] = user.ID.Hex()
	claims["exp"] = exp

	t, err := token.SignedString([]byte(a.env.JWT_SECRET))
	if err != nil {
		return ctx.SendStatus(fiber.StatusInternalServerError)
	}

	return ctx.JSON(fiber.Map{
		"id":       user.ID.Hex(),
		"username": user.Username,
		"email":    user.Email,
		"avatar":   user.Avatar,
		"exp":      exp,
		"token":    t,
	})
}
