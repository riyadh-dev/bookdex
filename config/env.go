package config

import (
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() error {
	if os.Getenv("GO_ENV") == "production" {
		return nil
	}

	if err := godotenv.Load(); err != nil {
		return err
	}

	return nil
}
