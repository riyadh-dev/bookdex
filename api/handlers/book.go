package handlers

import (
	"context"
	"rest-api/api/models"
	"rest-api/database"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetBooks(c *fiber.Ctx) error {
	cursor, err := database.GetCollection("books").Find(context.TODO(), bson.D{})
	if err != nil {
		return fiber.ErrInternalServerError
	}

	var books []models.Book
	err = cursor.All(context.TODO(), &books)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return c.JSON(books)
}

func GetBook(c *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		panic("Invalid id")
	}

	var book models.Book
	filter := bson.D{bson.E{Key: "_id", Value: id}}
	err = database.GetCollection("books").FindOne(context.TODO(), filter).Decode(&book)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return fiber.ErrNotFound
		}
		return fiber.ErrInternalServerError
	}

	return c.JSON(book)
}

func CreateBook(c *fiber.Ctx) error {
	var book models.Book
	err := c.BodyParser(&book)
	if err != nil {
		return fiber.ErrBadRequest
	}

	result, err := database.GetCollection("books").InsertOne(context.TODO(), book)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return c.JSON(fiber.Map{
		"id": result.InsertedID,
	})
}

func UpdateBook(c *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		panic("Invalid id")
	}

	var book models.Book
	err = c.BodyParser(&book)
	if err != nil {
		return fiber.ErrBadRequest
	}

	filter := bson.D{bson.E{Key: "_id", Value: id}}
	_, err = database.GetCollection("books").ReplaceOne(context.TODO(), filter, book)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return c.SendString("updated")
}

func DeleteBook(c *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return fiber.ErrBadRequest
	}

	filter := bson.D{bson.E{Key: "_id", Value: id}}
	_, err = database.GetCollection("books").DeleteOne(context.TODO(), filter)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return c.SendString("deleted")
}
