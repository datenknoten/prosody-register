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
    /**
     * the username of the registration
     */
    @IsString()
    @MinLength(3)
    @MaxLength(80)
    public username?: string;

    /**
     * The server the user wants an account on
     */
    @IsString()
    @IsIn(globalConfig.Hosts)
    public server?: string;

    /**
     * The email the user used for registration
     */
    @IsString()
    @Validate(CustomEmail)
    public email?: string;

    /**
     * The desired password the user wants to use
     */
    @IsString()
    @MinLength(3)
    public password?: string;

    /**
     * The confirmation of the password
     */
    @IsString()
    @MinLength(3)
    public passwordConfirmation?: string;

    /**
     * The recaptcha response
     */
    @IsString()
    @Expose({
        name: 'g-recaptcha-response',
    })
    public captchaResponse?: string;
}
