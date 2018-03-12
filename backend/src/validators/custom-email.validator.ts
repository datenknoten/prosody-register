import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

import * as isemail from 'isemail';

/**
 * Custom validator for email addresses
 */
@ValidatorConstraint({ name: 'customIsEmail', async: false })
export class CustomEmail implements ValidatorConstraintInterface {

    /**
     * Validate the e-mail via isemail
     */
    public validate(text: string, args: ValidationArguments) {
        return isemail.validate(text);
    }

    /**
     * Return the default error message
     */
    public defaultMessage(args: ValidationArguments) {
        return '$value is not a valid email';
    }
}
