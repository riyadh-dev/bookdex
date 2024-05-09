package storage

import (
	"go.uber.org/fx"
)

var FxModule = fx.Options(
	fx.Provide(newBooks),
	fx.Provide(newUsers),
	fx.Provide(newComments),
)
