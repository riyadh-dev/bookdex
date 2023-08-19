package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/riyadh-dev/go-rest-api-demo/models"
	"github.com/riyadh-dev/go-rest-api-demo/storage"
)

type Books struct {
	booksStorage *storage.Books
}

func newBooks(booksStorage *storage.Books) *Books {
	return &Books{booksStorage: booksStorage}
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
		//TODO look into other ways to not use magic strings
		switch err.Error() {
		case "not found":
			return fiber.ErrNotFound
		case "invalid id":
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
		//TODO look into other ways to not use magic strings
		switch err.Error() {
		case "not found":
			return fiber.ErrNotFound
		case "invalid id":
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendString("updated")
}

func (b *Books) Delete(ctx *fiber.Ctx) error {
	err := b.booksStorage.Delete(ctx.Params("id"))
	if err != nil {
		//TODO look into other ways to not use magic strings
		switch err.Error() {
		case "not found":
			return fiber.ErrNotFound
		case "invalid id":
			return fiber.ErrBadRequest
		default:
			return fiber.ErrInternalServerError
		}
	}

	return ctx.SendString("deleted")
}
