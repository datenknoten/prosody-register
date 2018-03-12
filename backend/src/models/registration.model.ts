import {
    Equals,
    IsEmail,
    IsIn,
    IsString,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';

import { CustomEmail } from '../validators';

import { Expose } from 'class-transformer';
import { globalConfig } from '..';

/**
 * Registration model
 */
export class Registration {


    @IsString()
    @MinLength(3)
    @MaxLength(80)
    public username?: string;

    @IsString()
    @IsIn(globalConfig.Hosts)
    public server?: string;

    @IsString()
    @Validate(CustomEmail)
    public email?: string;

    @IsString()
    @MinLength(3)
    public password?: string;

    @IsString()
    @MinLength(3)
    public passwordConfirmation?: string;

    @IsString()
    @Expose({
        name: 'g-recaptcha-response'
    })
    public captchaResponse?: string;
}
