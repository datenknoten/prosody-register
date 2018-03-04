import 'reflect-metadata';

import {
    createExpressServer,
} from 'routing-controllers';

import {
    RegistrationController,
} from './controller';

import {
    Application,
} from 'express';

const app: Application = createExpressServer({

    controllers: [
        RegistrationController,
    ],
    defaultErrorHandler: false,
    development: true,
});

app.listen(3000, () => {
    console.log('Serving on http://localhost:3000');
});
