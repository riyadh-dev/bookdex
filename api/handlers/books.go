package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"github.com/riyadh-dev/bookdex/api/storage"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Books struct {
	booksStorage *storage.Books
	customErrors *config.CustomErrors
	validator    *config.Validator
}

func newBooks(
	booksStorage *storage.Books,
	customErrors *config.CustomErrors,
	validator *config.Validator,
) *Books {
	return &Books{
		booksStorage: booksStorage,
		customErrors: customErrors,
		validator:    validator,
	}
}

func (b *Books) GetAll(ctx *fiber.Ctx) error {
	books, err := b.booksStorage.GetAll(ctx.Query("q"))
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(books)
}

func (b *Books) GetById(ctx *fiber.Ctx) error {
	book, err := b.booksStorage.GetById(ctx.Params("id"))
	if err != nil {
		switch err {
		case b.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case b.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.JSON(book)
}

func (b *Books) GetBySubmitterId(ctx *fiber.Ctx) error {
	book, err := b.booksStorage.GetBySubmitterId(ctx.Params("id"))
	if err != nil {
		switch err {
		case b.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case b.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.JSON(book)
}

func (b *Books) Create(ctx *fiber.Ctx) error {
	var requestBody models.InsertBookReqInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	submitterId := claims["id"].(string)
	objectId, err := primitive.ObjectIDFromHex(submitterId)
	if err != nil {
		return fiber.ErrBadRequest
	}

	storageInput := &models.InsertBookStorageInput{
		Title:    requestBody.Title,
		Author:   requestBody.Author,
		Cover:    requestBody.Cover,
		Synopsis: requestBody.Synopsis,

		SubmitterID: objectId,
	}

	err = b.validator.Validate(storageInput)
	if err != nil {
		return &fiber.Error{
			Code:    fiber.ErrBadRequest.Code,
			Message: err.Error(),
		}
	}

	id, err := b.booksStorage.Create(storageInput)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.Map{"id": id})
}

func (b *Books) Update(ctx *fiber.Ctx) error {
	requestBody := new(models.UpdateBookInput)
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = b.booksStorage.Update(ctx.Params("id"), requestBody)
	if err != nil {
		switch err {
		case b.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case b.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (b *Books) Delete(ctx *fiber.Ctx) error {
	err := b.booksStorage.Delete(ctx.Params("id"))
	if err != nil {
		switch err {
		case b.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case b.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (b *Books) Bookmark(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	err := b.booksStorage.Bookmark(ctx.Params("id"), userId)
	if err != nil {
		switch err {
		case b.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case b.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (b *Books) Unbookmark(ctx *fiber.Ctx) error {
	claims := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)
	userId := claims["id"].(string)

	err := b.booksStorage.Unbookmark(ctx.Params("id"), userId)
	if err != nil {
		switch err {
		case b.customErrors.ErrNotFound:
			return fiber.ErrNotFound
		case b.customErrors.ErrInvalidId:
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendStatus(fiber.StatusOK)
}
