package database

import (
	"context"

	"github.com/riyadh-dev/bookdex/api/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/fx"
)

var FxModule = fx.Options(
	fx.Provide(newDataBase),
)

func newDataBase(lifecycle fx.Lifecycle, env *config.Env) *mongo.Database {
	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI(env.MONGODB_URI),
	)

	db := client.Database(env.DB_NAME)

	lifecycle.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			return err
		},
		OnStop: func(ctx context.Context) error {
			err := db.Client().Disconnect(context.Background())
			return err
		},
	})

	return db
}
