import {
    Body,
    BodyParam,
    ContentType,
    Controller,
    Get,
    Param,
    Post,
    QueryParam,
    Redirect,
    Req,
    Res,
    UseBefore,
} from 'routing-controllers';

import * as fs from 'fs-extra';
import * as nm from 'nodemailer';
import * as path from 'path';
import * as util from 'util';
import * as zxcvbn from 'zxcvbn';

import {
    v1 as uuidV1,
} from 'uuid';

// tslint:disable-next-line: no-var-requires
const formTemplate = require('../templates/form.twig').template;
// tslint:disable-next-line: no-var-requires
const mailTemplate = require('../templates/mail-body.twig').template;
// tslint:disable-next-line: no-var-requires
const successTemplate = require('../templates/success.twig').template;

// tslint:disable-next-line: no-var-requires
const bodyParser = require('body-parser');

import * as superagent from 'superagent';

import {
    Request,
    Response,
} from 'express';

import {
    Registration,
} from '../models/registration.model';

import {
    classToPlain, plainToClass,
} from 'class-transformer';
import {
    validate,
} from 'class-validator';

import { globalConfig } from '..';

/**
 * Class for the Registration Controller
 */
@Controller()
export class RegistrationController {

    /**
     * Just display the form
     */
    @Get('/')
    public async displayForm(@QueryParam('verify') verify: boolean = false) {
        const templateFile = path.resolve(__dirname, '../templates/form.twig');

        return formTemplate.render({
            config: globalConfig,
            verify,
        });
    }

    /**
     * Submit the form
     *
     * @param form The registration data from the form
     * @param response The HTTP-Response, is needed for redirections
     */
    @Post('/')
    @UseBefore(bodyParser.urlencoded())
    public async registerUser(
        @Body({
            validate: false,
        }) form: Registration,
        @Res() response: Response,
    ) {
        const errors = await validate(form);

        if (errors.length > 0) {
            const errorMap: any = {};

            for (const error of errors) {
                if (!Array.isArray(errorMap[error.property])) {
                    errorMap[error.property] = [];
                }
                errorMap[error.property].push(error);
            }

            errorMap.hasErrors = true;

            return formTemplate.render({
                config: globalConfig,
                errorMap,
                form,
            });
        } else {
            if (!(await this.isCaptchaValid(form))) {
                const errorMap: any = {};

                errorMap.hasErrors = true;
                errorMap.captcha = [{
                    constraints: {
                        message: 'Capcha is missing or invalid',
                    },
                }];

                return formTemplate.render({
                    config: globalConfig,
                    errorMap,
                    form,
                });
            } else if (await this.userIsTaken(form)) {
                const errorMap: any = {};

                errorMap.hasErrors = true;
                errorMap.captcha = [{
                    constraints: {
                        message: 'User is already taken, choose another',
                    },
                }];

                return formTemplate.render({
                    config: globalConfig,
                    errorMap,
                    form,
                });
            } else {
                await this.sendMail(form);

                return response.redirect(`${globalConfig.Path}?verify=true`);
            }

        }
    }

    /**
     * JSON-API for zxcvbn so it does not need to be bundled
     *
     * @param password The password to be checked
     */
    @Post('/password/strength')
    @ContentType('application/json')
    public async passwordStreng(@BodyParam('password') password: string) {
        return zxcvbn.default(password);
    }

    /**
     * Verify the mail of the user
     */
    @Get('/verify/:id')
    public async verifyMail(@Param('id') id: string) {
        const filePath = path.join(globalConfig.DataDir, id);

        if (!(await fs.pathExists(filePath))) {
            const errorMap: any = {};

            errorMap.hasErrors = true;
            errorMap.captcha = [{
                constraints: {
                    message: 'Verification ID is not known',
                },
            }];

            return formTemplate.render({
                config: globalConfig,
                errorMap,
            });
        }

        const fileContents = JSON.parse(await fs.readFile(filePath, 'utf-8'));

        const registration = plainToClass(Registration, fileContents as object);

        const jid = `${registration.username}@${registration.server}`;

        const response = await superagent
            .post(`${globalConfig.ProsodyConfig.RestURL}/user/${registration.username}`)
            .auth(globalConfig.ProsodyConfig.User, globalConfig.ProsodyConfig.Password)
            .ok((res) => res.status < 500)
            .set('Host', registration.server)
            .send({
                password: registration.password,
            });

        await fs.unlink(filePath);

        if (response.status !== 201) {
            const errorMap: any = {};

            errorMap.hasErrors = true;
            errorMap.captcha = [{
                constraints: {
                    message: 'Something went wrong with your registration',
                },
            }];

            return formTemplate.render({
                config: globalConfig,
                errorMap,
                registration,
            });
        }

        return successTemplate.render();

    }

    /**
     * Checks if the provided captcha is valid
     *
     * @param registration the form data
     */
    private async isCaptchaValid(registration: Registration): Promise<boolean> {
        const requestData = {
            response: registration.captchaResponse,
            secret: globalConfig.RecaptchaSecretKey,
        };

        try {
            const captchaResponse = await superagent
                .post('https://www.google.com/recaptcha/api/siteverify')
                .type('form')
                .send(requestData);

            return captchaResponse.body && (captchaResponse.body.success === true);
        } catch (error) {
            return false;
        }
    }

    /**
     * Send the validation mail to the user
     *
     * @param registration The form data
     */
    private async sendMail(registration: Registration) {
        const id = uuidV1();

        const filePath = path.join(globalConfig.DataDir, id);

        if (await fs.pathExists(filePath)) {
            throw new Error('File already exists');
        }

        await fs.writeFile(filePath, JSON.stringify(classToPlain(registration)));

        const transport = nm.createTransport(globalConfig.MailSettings);

        const url = `${globalConfig.Url}${id}`;

        const message = {
            from: globalConfig.MailSender,
            subject: `Registration for ${registration.server}`,
            text: mailTemplate.render({
                url,
            }),
            to: registration.email,
        };

        await transport.sendMail(message);
    }

    /**
     * Indicates if the user is already taken
     *
     * @param registration form data
     */
    private async userIsTaken(registration: Registration): Promise<boolean> {
        const response = await superagent
            .get(`${globalConfig.ProsodyConfig.RestURL}/user/${registration.username}`)
            .set('Host', registration.server)
            .ok((res) => res.status < 500)
            .auth(globalConfig.ProsodyConfig.User, globalConfig.ProsodyConfig.Password);
        return response.status !== 404;
    }
}
