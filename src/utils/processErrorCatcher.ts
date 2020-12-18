import _ from 'lodash';

let haveRegistered = false;

function unhandledRejectionHandler(reason: {} | null | undefined, promise: Promise<any>): void {
  let err = new Error(`process unhandledRejection`);
  let meta = '';
  if (reason instanceof Error) {
    err = reason;
  } else {
    meta = String(reason).toString();
  }

  let msg = `process unhandledRejection`;
  if (_.isEmpty(meta)) {
    console.error(msg, err);
  } else {
    console.error(msg, err, { reason: meta });
  }
}

function uncaughtExceptionHandler(error: Error): void {
  console.error(`process uncaughtException`, error);
}

function multipleResolvHandler(type: NodeJS.MultipleResolveType, promise: Promise<any>, value: any): void {
  let msg = `process multipleResolves`;
  let err = new Error(`process multipleResolves`);
  console.error(msg, err, { type, value });
}

export function registerProcessErrorCatcher() {
  if (haveRegistered) {
    console.warn('ProcessErrorCatcher have registered');
    return;
  }

  process.on('multipleResolves', multipleResolvHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);
  process.on('unhandledRejection', unhandledRejectionHandler);

  haveRegistered = true;
}
