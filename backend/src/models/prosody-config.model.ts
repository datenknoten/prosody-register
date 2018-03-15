import {
    IsString, IsUrl,
} from 'class-validator';

/**
 * Configuration of the prosody server
 */
export class ProsodyConfig {
    /**
     * Adminuser which is used for connecting
     */
    @IsString()
    public User!: string;

    /**
     * Password for the user used for connecting
     */
    @IsString()
    public Password!: string;

    /**
     * The Base-Path of the prosody rest api
     */
    @IsString()
    @IsUrl()
    public RestURL!: string;

}
