package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	PORT        string
	MONGODB_URI string
	DB_NAME     string
}

func NewEnv() *Env {
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			panic(err)
		}
	}

	return &Env{
		PORT:        getEnvVar("PORT"),
		MONGODB_URI: getEnvVar("MONGODB_URI"),
		DB_NAME:     getEnvVar("DB_NAME"),
	}
}

func getEnvVar(key string) string {
	envVar := os.Getenv(key)
	if envVar == "" {
		panic("Missing environment variable: " + key)
	}
	return envVar
}
