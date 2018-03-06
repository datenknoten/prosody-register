import 'reflect-metadata';

import {
    createExpressServer,
} from 'routing-controllers';

import {
    RegistrationController,
} from './controller';

import {
    Application,
    static as staticFiles,
} from 'express';

import * as path from 'path';

const app: Application = createExpressServer({

    controllers: [
        RegistrationController,
    ],
    defaultErrorHandler: false,
    development: true,
});

app.use(staticFiles(path.resolve(__dirname, 'assets')));

app.listen(3000, () => {
    console.log('Serving on http://localhost:3000');
});
