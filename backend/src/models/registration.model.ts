import {
    Equals,
    IsEmail,
    IsIn,
    IsString,
    MaxLength,
    Validate,
    MinLength,
} from 'class-validator';

import { CustomEmail } from '../validators';

export class Registration {
    public static servers: string[] = [
        'boese-ban.de',
        'datenknoten.me',
        'kaoskinder.de',
    ];

    @IsString()
    @MinLength(3)
    @MaxLength(80)
    public username?: string;

    @IsString()
    @IsIn(Registration.servers)
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
}
