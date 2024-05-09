package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"github.com/riyadh-dev/bookdex/api/storage"
)

type Ratings struct {
	ratingsStorage *storage.Ratings
	customErrors   *config.CustomErrors
}

func newRatings(
	ratingsStorage *storage.Ratings,
	customErrors *config.CustomErrors,
) *Ratings {
	return &Ratings{ratingsStorage: ratingsStorage, customErrors: customErrors}
}

func (r *Ratings) GetByBookIdAndRaterId(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	bookId := ctx.Params("id")

	rating, err := r.ratingsStorage.GetByBookIdAndRaterId(bookId, userId)
	if err != nil {
		switch err {
		case r.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		case r.customErrors.ErrNotFound:
			return ctx.JSON(fiber.Map{})
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.JSON(rating)
}

func (r *Ratings) Create(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	bookId := ctx.Params("id")

	requestBody := new(models.RatingReqInput)
	err := ctx.BodyParser(requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = r.ratingsStorage.Create(bookId, userId, requestBody.Value)
	if err != nil {
		if err == r.customErrors.ErrInvalidId {
			return fiber.ErrBadRequest
		}
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.StatusOK)

}

func (r *Ratings) Update(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	bookId := ctx.Params("id")

	requestBody := new(models.RatingReqInput)
	err := ctx.BodyParser(requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = r.ratingsStorage.Update(bookId, userId, requestBody.Value)
	if err != nil {
		if err == r.customErrors.ErrInvalidId {
			return fiber.ErrBadRequest
		}
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.StatusOK)
}

func (r *Ratings) Delete(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	bookId := ctx.Params("id")

	err := r.ratingsStorage.Delete(bookId, userId)
	if err != nil {
		if err == r.customErrors.ErrInvalidId {
			return fiber.ErrBadRequest
		}
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.StatusOK)
}
