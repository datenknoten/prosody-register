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
} from 'routing-controllers';

import * as util from 'util';

import * as path from 'path';

const Twig = require('twig');
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

async function renderTemplateFile(templateFile: string, params: any = {}) {
    return new Promise((resolve, reject) => {
        Twig.renderFile(templateFile, params, (err: Error, result: string) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

@Controller()
export class RegistrationController {

    @Get('/')
    public async displayForm() {
        const templateFile = path.resolve(__dirname, '../templates/form.twig');

        return renderTemplateFile(templateFile, {
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
            const templateFile = path.resolve(__dirname, '../templates/form.twig');

            const errorMap: any = {};

            for (const error of errors) {
                if (!Array.isArray(errorMap[error.property])) {
                    errorMap[error.property] = [];
                }
                errorMap[error.property].push(error);
            }

            errorMap.hasErrors = true;

            console.dir(errorMap);

            return renderTemplateFile(templateFile, {
                errorMap,
                form,
                servers: Registration.servers,
            });
        } else {
            response.redirect('/');
        }
    }
}
