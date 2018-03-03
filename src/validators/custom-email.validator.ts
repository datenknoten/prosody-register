import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

import * as isemail from 'isemail';

@ValidatorConstraint({ name: 'customIsEmail', async: false })
export class CustomEmail implements ValidatorConstraintInterface {

    public validate(text: string, args: ValidationArguments) {
        return isemail.validate(text);
    }

    public defaultMessage(args: ValidationArguments) {
        return '$value is not a valid email';
    }
}
