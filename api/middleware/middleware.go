package middleware

import "go.uber.org/fx"

var FxModule = fx.Options(fx.Provide(newAuth))
