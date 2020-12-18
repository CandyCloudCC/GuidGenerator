import _ from 'lodash';
import Koa from 'koa';

import { config } from '../config';
import { registerHandlers as registerKoaHandlers } from './koa';
import { registerProcessErrorCatcher } from './utils/processErrorCatcher';
import { validateConfigStructure } from './libs/ConfigSchema';

const app = new Koa();
const originalErrorHandler = app.onerror;

function custKoaErrorHandler(err: Error): void {
  console.error('koa error', err);
  originalErrorHandler.call(app, err);
}

app.onerror = custKoaErrorHandler;

async function main() {
  registerProcessErrorCatcher();

  const vConfig = validateConfigStructure(config);

  registerKoaHandlers(app);

  app.listen(vConfig.port);
}

main();
