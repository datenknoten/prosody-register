import {
    ArrayMinSize,
    IsFQDN,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

import {
    Type,
} from 'class-transformer';

import {
    ProsodyConfig,
} from './prosody-config.model';

import * as path from 'path';

import * as nm from 'nodemailer';

/**
 * A configuration for the application
 */
export class Config {
    /**
     * The sitekey of recaptcha
     */
    @IsString()
    @MinLength(40)
    @MaxLength(40)
    public RecaptchaSiteKey!: string;

    /**
     * The secret key of recapchta
     */
    @IsString()
    @MinLength(40)
    @MaxLength(40)
    public RecaptchaSecretKey!: string;

    /**
     * The URL the application is hosted under
     */
    @IsString()
    @IsUrl()
    public Url!: string;

    /**
     * The hosts the user can register
     */
    @IsString({
        each: true,
    })
    @IsFQDN({
        require_tld: true,
    }, {
        each: true,
    })
    @ArrayMinSize(1)
    public Hosts: string[] = [];

    /**
     * E-Mail-Address used for sending the verification mail
     */
    @IsString()
    public MailSender!: string;

    /**
     * Path where the registration data is stored
     */
    @IsString()
    @IsOptional()
    public DataDir: string = path.resolve(__dirname, '../data');

    /**
     * Config of the prosody server
     */
    @ValidateNested()
    @Type(() => ProsodyConfig)
    public ProsodyConfig!: ProsodyConfig;

    /**
     * Settings for nodemailer
     */
    public MailSettings!: any;

    /**
     * The path the form is hosted under
     */
    @IsString()
    @MinLength(1)
    public Path: string = '/';

    /**
     * The port the service is listening on
     */
    @IsNumber()
    @IsPositive()
    public ListenPort: number = 3000;
}
