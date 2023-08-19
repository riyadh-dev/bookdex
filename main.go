package main

import (
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/database"
	"github.com/riyadh-dev/go-rest-api-demo/handlers"
	"github.com/riyadh-dev/go-rest-api-demo/middleware"
	"github.com/riyadh-dev/go-rest-api-demo/server"
	"github.com/riyadh-dev/go-rest-api-demo/storage"
	"go.uber.org/fx"
)

func main() {
	//TODO change to singular
	fx.New(
		config.FxModule,
		database.FxModule,
		storage.FxModule,
		handlers.FxModule,
		middleware.FxModule,
		server.FxModule,
	).Run()
}
