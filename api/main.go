package main

import (
	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/database"
	"github.com/riyadh-dev/bookdex/api/handlers"
	"github.com/riyadh-dev/bookdex/api/middleware"
	"github.com/riyadh-dev/bookdex/api/server"
	"github.com/riyadh-dev/bookdex/api/storage"
	"go.uber.org/fx"
)

func main() {
	fx.New(
		config.FxModule,
		database.FxModule,
		storage.FxModule,
		handlers.FxModule,
		middleware.FxModule,
		server.FxModule,
	).Run()
}
