import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Redirect,
    Req,
    Res,
    UseBefore,
    ContentType,
    BodyParam,
} from 'routing-controllers';

import * as util from 'util';

import * as path from 'path';

import * as zxcvbn from 'zxcvbn';

const template = require('../templates/form.twig').template;

const bodyParser = require('body-parser');

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

// async function renderTemplateFile(templateFile: string, params: any = {}) {
//     return new Promise((resolve, reject) => {
//         Twig.renderFile(templateFile, params, (err: Error, result: string) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(result);
//         });
//     });
// }

@Controller()
export class RegistrationController {

    @Get('/')
    public async displayForm() {
        const templateFile = path.resolve(__dirname, '../templates/form.twig');

        return template.render({
            servers: Registration.servers,
        });
    }

    @Post('/')
    @UseBefore(bodyParser.urlencoded())
    public async registerUser(
        @Body() form: Registration,
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

            console.dir(errorMap);

            return template.render({
                errorMap,
                form,
                servers: Registration.servers,
            });
        } else {
            response.redirect('/');
        }
    }

    @Post('/password/strength')
    @ContentType('application/json')
    public async passwordStreng(@BodyParam('password') password: string) {
        return zxcvbn.default(password);
    }
}
