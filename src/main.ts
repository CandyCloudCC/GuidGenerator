import _ from 'lodash';
import Koa from 'koa';

process.on('uncaughtException', err => {
  console.error(`process uncaughtException`, err);
});

process.on('unhandledRejection', (reason, promise) => {
  let err = new Error(`process unhandledRejection`);
  let meta = '';
  if (reason instanceof Error) {
    err = reason;
  } else {
    meta = String(reason).toString();
  }

  console.error(`process unhandledRejection`, err, _.isEmpty(meta) ? undefined : { reason: meta });
});

process.on('multipleResolves', (type, promise, value) => {
  console.error(`process multipleResolves`, new Error(`process multipleResolves`), { type, value });
});

import { config } from '../config';
import { registerHandlers as registerKoaHandlers } from './koa';

const app = new Koa();
const originalErrorHandler = app.onerror;
app.onerror = (err: Error) => {
  console.error('koa error', err);
  originalErrorHandler.call(app, err);
};

async function main() {
  registerKoaHandlers(app);
  app.listen(config.port);
}

main();
