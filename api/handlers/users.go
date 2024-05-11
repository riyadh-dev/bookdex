package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"github.com/riyadh-dev/bookdex/api/storage"
	"golang.org/x/crypto/bcrypt"
)

type Users struct {
	usersStorage *storage.Users
	customErrors *config.CustomErrors
}

func newUsers(
	usersStorage *storage.Users,
	customErrors *config.CustomErrors,
) *Users {
	return &Users{
		usersStorage: usersStorage,
		customErrors: customErrors,
	}
}

func (u *Users) GetAllMocked(ctx *fiber.Ctx) error {
	users, err := u.usersStorage.GetAllMocked()
	if err != nil {
		return err
	}

	return ctx.JSON(users)
}

func (u *Users) Update(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	updateUserId := ctx.Params("id")

	if updateUserId != userId {
		return fiber.ErrForbidden
	}

	requestBody := new(models.UpdateUserInput)
	err := ctx.BodyParser(requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	if requestBody.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(requestBody.Password),
			bcrypt.DefaultCost,
		)
		if err != nil {
			return fiber.ErrInternalServerError
		}
		requestBody.Password = string(hashedPassword)
	}

	err = u.usersStorage.Update(ctx.Params("id"), requestBody)
	if err != nil {
		switch err {
		case u.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case u.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (u *Users) GetById(ctx *fiber.Ctx) error {
	user, err := u.usersStorage.GetById(ctx.Params("id"))
	if err != nil {
		switch err {
		case u.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case u.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.JSON(fiber.Map{
		"id":       user.ID.Hex(),
		"username": user.Username,
		"email":    user.Email,
		"avatar":   user.Avatar,
	})
}
