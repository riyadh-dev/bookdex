package config

import "errors"

type CustomErrors struct {
	ErrInvalidId error
	ErrNotFound  error
}

func newCustomErrors() *CustomErrors {
	return &CustomErrors{
		ErrInvalidId: errors.New("invalid id"),
		ErrNotFound:  errors.New("not found"),
		//TODO add duplicate key
	}
}
