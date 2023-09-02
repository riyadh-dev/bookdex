package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Env struct {
	IS_PROD bool

	PORT string

	MONGODB_URI string
	DB_NAME     string

	JWT_SECRET    string
	COOKIE_SECRET string
	AUTH_EXP_HOUR int

	CLIENT_URL string
}

func newEnv() *Env {
	IS_PROD := os.Getenv("GO_ENV") == "production"
	if !IS_PROD {
		if err := godotenv.Load(); err != nil {
			log.Fatal(err)
		}
	}

	return &Env{
		IS_PROD: IS_PROD,

		PORT: getEnvVar("PORT"),

		MONGODB_URI: getEnvVar("MONGODB_URI"),
		DB_NAME:     getEnvVar("DB_NAME"),

		JWT_SECRET:    getEnvVar("JWT_SECRET"),
		COOKIE_SECRET: getEnvVar("COOKIE_SECRET"),
		AUTH_EXP_HOUR: getIntEnvVar("AUTH_EXP_HOUR"),

		CLIENT_URL: getEnvVar("CLIENT_URL"),
	}
}

func getEnvVar(key string) string {
	envVar := os.Getenv(key)
	if envVar == "" {
		log.Fatal("Missing environment variable: " + key)
	}
	return envVar
}

func getIntEnvVar(key string) int {
	envVar := os.Getenv(key)
	if envVar == "" {
		log.Fatal("Missing environment variable: " + key)
	}
	envVarInt, err := strconv.Atoi(envVar)
	if err != nil {
		log.Fatal("Invalid environment variable: " + key)
	}
	return envVarInt
}
