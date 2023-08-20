package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/models"
	"github.com/riyadh-dev/go-rest-api-demo/storage"
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
	//userId := ctx.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)["userId"]

	books, err := b.booksStorage.GetAll()
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

func (b *Books) Create(ctx *fiber.Ctx) error {
	var requestBody models.InsertBookInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	err = b.validator.Validate(&requestBody)
	if err != nil {
		return &fiber.Error{
			Code:    fiber.ErrBadRequest.Code,
			Message: err.Error(),
		}
	}

	id, err := b.booksStorage.Create(&requestBody)
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
