import {
    Body,
    BodyParam,
    ContentType,
    Controller,
    Get,
    Param,
    Post,
    Redirect,
    Req,
    Res,
    UseBefore,
} from 'routing-controllers';

import * as util from 'util';

import * as path from 'path';

import * as zxcvbn from 'zxcvbn';

// tslint:disable-next-line: no-var-requires
const template = require('../templates/form.twig').template;

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
    public async displayForm() {
        const templateFile = path.resolve(__dirname, '../templates/form.twig');

        return template.render({
            config: globalConfig,
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

            return template.render({
                config: globalConfig,
                errorMap,
                form,
            });
        } else {
            // The user passed all validation, lets check the captcha
            const requestData = {
                response: form.captchaResponse,
                secret: globalConfig.RecaptchaSecretKey,
            };

            const captchaResponse = await superagent
                .post('https://www.google.com/recaptcha/api/siteverify')
                .type('form')
                .send(requestData);

            if (captchaResponse.body && (captchaResponse.body.success === true)) {
                return response.redirect('/');
            } else {
                const errorMap: any = {};

                errorMap.hasErrors = true;
                errorMap.captcha = [{
                    constraints: {
                        message: 'Capcha is missing or invalid',
                    },
                }];

                return template.render({
                    config: globalConfig,
                    errorMap,
                    form,
                });
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
}
