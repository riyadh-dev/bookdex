package models

import "github.com/golang-jwt/jwt/v5"

type JWTClaims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}
