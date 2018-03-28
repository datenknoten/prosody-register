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
        if ((args.value && (args.value.lenth === 0)) || (!args.value)) {
            return 'please specify a valid e-mail address';
        } else {
            return '$value is not a valid e-mail address';
        }
    }
}
