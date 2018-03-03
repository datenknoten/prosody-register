import 'reflect-metadata';

import {
    createExpressServer,
} from 'routing-controllers';

import {
    RegistrationController,
} from './controller';

const app = createExpressServer({

    controllers: [
        RegistrationController,
    ],
    defaultErrorHandler: false,
    development: true,
});

app.listen(3000);
