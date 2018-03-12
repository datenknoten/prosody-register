import 'reflect-metadata';

import {
    createExpressServer,
} from 'routing-controllers';

import {
    Application,
    static as staticFiles,
} from 'express';

import {
    plainToClass,
} from 'class-transformer';

import * as fs from 'fs-extra';

import * as path from 'path';

import { Config } from './models/config.model';

import { validate } from 'class-validator';

export let globalConfig: Config;

(async () => {
    try {
        let configPath = process.argv.pop();

        if (!configPath) {
            process.exit(-1);
            throw new Error();
        }

        if (configPath.startsWith('..') || configPath.startsWith('.')) {
            configPath = path.resolve(__dirname, configPath);
        }

        if (!(await fs.pathExists(configPath))) {
            throw new Error('Config does not exists');
        }

        const configContents = await fs.readFile(configPath, 'utf-8');

        globalConfig = plainToClass(Config, JSON.parse(configContents) as Object);

        const results = await validate(globalConfig);

        if (results.length > 0) {
            console.error('Your config is invalid, please fix it');
            console.error(results);
            process.exit(-1);
        }

        const controllers = await import('./controller');

        const app: Application = createExpressServer({

            controllers: [
                controllers.RegistrationController,
            ],
            defaultErrorHandler: false,
            development: true,
        });

        app.use(staticFiles(path.resolve(__dirname, 'assets')));

        app.listen(3000, () => {
            // tslint:disable-next-line: no-console
            console.log('Serving on http://localhost:3000');
        });
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
})();




