package main

import (
	"github.com/riyadh-dev/go-rest-api-demo/config"
	"github.com/riyadh-dev/go-rest-api-demo/database"
	"github.com/riyadh-dev/go-rest-api-demo/handlers"
	"github.com/riyadh-dev/go-rest-api-demo/server"
	"go.uber.org/fx"
)

func main() {
	fx.New(
		config.FxModule,
		database.FxModule,
		handlers.FxModule,
		server.FxModule,
	).Run()
}
