package handlers

import "go.uber.org/fx"

var FxModule = fx.Options(
	fx.Provide(newBooks, newAuth),
)
