package handlers

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/riyadh-dev/go-rest-api-demo/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Books struct {
	dbConnection *mongo.Database
}

func NewBooks(dbConnection *mongo.Database) *Books {
	return &Books{dbConnection: dbConnection}
}

func (b *Books) GetBooks(ctx *fiber.Ctx) error {
	cursor, err := b.dbConnection.Collection("books").Find(context.TODO(), bson.D{})
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

func (b *Books) GetBook(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		panic("Invalid id")
	}

	var book models.Book
	filter := bson.M{"_id": id}
	err = b.dbConnection.Collection("books").FindOne(context.TODO(), filter).Decode(&book)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return fiber.ErrNotFound
		}
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(book)
}

func (b *Books) CreateBook(ctx *fiber.Ctx) error {
	var requestBody models.InsertBookInput
	err := ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	result, err := b.dbConnection.Collection("books").InsertOne(context.TODO(), requestBody)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.JSON(fiber.Map{
		"id": result.InsertedID,
	})
}

func (b *Books) UpdateBook(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		panic("Invalid id")
	}

	requestBody := new(models.UpdateBookInput)
	err = ctx.BodyParser(&requestBody)
	if err != nil {
		return fiber.ErrBadRequest
	}

	_, err = b.dbConnection.Collection("books").UpdateByID(context.TODO(), id, bson.M{"$set": requestBody})
	if err != nil {
		log.Println(err)
		return fiber.ErrInternalServerError
	}

	return ctx.SendString("updated")
}

func (b *Books) DeleteBook(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return fiber.ErrBadRequest
	}

	filter := bson.M{"_id": id}
	_, err = b.dbConnection.Collection("books").DeleteOne(context.TODO(), filter)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return ctx.SendString("deleted")
}
