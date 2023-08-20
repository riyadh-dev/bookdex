package config

import (
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

type Validator struct {
	validate *validator.Validate
}

func newValidator() *Validator {
	return &Validator{validate: validator.New()}
}

func (v *Validator) Validate(data any) error {
	errs := v.validate.Struct(data)
	if errs == nil {
		return nil
	}

	var validationErrors []string
	for _, err := range errs.(validator.ValidationErrors) {
		currentFieldError := fmt.Sprintf(
			"[%s]: '%v' does not satisfy the '%s' constraint",
			err.Field(),
			err.Value(),
			err.Tag(),
		)

		validationErrors = append(validationErrors, currentFieldError)
	}

	return errors.New((strings.Join(validationErrors, ", ")))

}
