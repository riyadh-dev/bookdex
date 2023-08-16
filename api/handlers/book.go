package handlers

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/riyadh-dev/go-rest-api-demo/api/models"
	"github.com/riyadh-dev/go-rest-api-demo/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetBooks(ctx *fiber.Ctx) error {
	cursor, err := database.GetCollection("books").Find(context.TODO(), bson.D{})
	if err != nil {
		return fiber.ErrInternalServerError
	}

	books := make([]models.Book, 0)
	err = cursor.All(context.TODO(), &books)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(books)
}

func GetBook(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		panic("Invalid id")
	}

	var book models.Book
	filter := bson.M{"_id": id}
	err = database.GetCollection("books").FindOne(context.TODO(), filter).Decode(&book)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return fiber.ErrNotFound
		}
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(book)
}

func CreateBook(ctx *fiber.Ctx) error {
	var requestBody models.InsertBookRequest
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	result, err := database.GetCollection("books").InsertOne(context.TODO(), requestBody)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.Map{
		"id": result.InsertedID,
	})
}

func UpdateBook(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		panic("Invalid id")
	}

	requestBody := new(models.UpdateBookRequest)
	err = ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	_, err = database.GetCollection("books").UpdateByID(context.TODO(), id, bson.M{"$set": requestBody})
	if err != nil {
		log.Println(err)
		return fiber.ErrInternalServerError
	}

	return ctx.SendString("updated")
}

func DeleteBook(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return fiber.ErrBadRequest
	}

	filter := bson.M{"_id": id}
	_, err = database.GetCollection("books").DeleteOne(context.TODO(), filter)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.SendString("deleted")
}
