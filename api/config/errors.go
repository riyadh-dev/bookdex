package config

import "errors"

type CustomErrors struct {
	ErrInvalidId    error
	ErrNotFound     error
	ErrDuplicateKey error
}

func newCustomErrors() *CustomErrors {
	return &CustomErrors{
		ErrInvalidId:    errors.New("invalid id"),
		ErrNotFound:     errors.New("not found"),
		ErrDuplicateKey: errors.New("duplicate key"),
	}
}
