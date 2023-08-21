package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Env struct {
	PORT string

	MONGODB_URI string
	DB_NAME     string

	JWT_SECRET    string
	COOKIE_SECRET string
	AUTH_EXP_HOUR int
}

func newEnv() *Env {
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			panic(err)
		}
	}

	return &Env{
		PORT: getEnvVar("PORT"),

		MONGODB_URI: getEnvVar("MONGODB_URI"),
		DB_NAME:     getEnvVar("DB_NAME"),

		JWT_SECRET:    getEnvVar("JWT_SECRET"),
		COOKIE_SECRET: getEnvVar("COOKIE_SECRET"),
		AUTH_EXP_HOUR: getIntEnvVar("AUTH_EXP_HOUR"),
	}
}

func getEnvVar(key string) string {
	envVar := os.Getenv(key)
	if envVar == "" {
		panic("Missing environment variable: " + key)
	}
	return envVar
}

func getIntEnvVar(key string) int {
	envVar := os.Getenv(key)
	if envVar == "" {
		panic("Missing environment variable: " + key)
	}
	envVarInt, err := strconv.Atoi(envVar)
	if err != nil {
		panic("Invalid environment variable: " + key)
	}
	return envVarInt
}
