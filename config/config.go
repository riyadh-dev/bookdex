package config

import "go.uber.org/fx"

var FxModule = fx.Options(
	fx.Provide(newEnv),
	fx.Provide(newCustomErrors),
)
