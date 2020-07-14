import _ from 'lodash';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';
import koaCompress from 'koa-compress';
const ntpClient = require('ntp-client');

import { config } from '../config';

let offset = 0;
let preMilliseconds = 0;
let getNTPCompleted = false;
const serviceUniqueCode = _.padStart(config.serviceUniqueCode.toString(2), 10, '0');
/**
 * 以 2020 年为基准元年，那么 41 位整数所表达得有效年份有约 69 年
 */
const YearOneMS = new Date('Jan 01 2020 GMT').valueOf();
const numberStrArray: string[] = [];
for (let i = 0; i < 2 ** 12; i++) {
  numberStrArray.push(_.padStart(i.toString(2), 12, '0'));
}

function getNTPTime(ntpServerUrl: string): Promise<Date> {
  return new Promise(function (resolve, reject) {
    ntpClient.getNetworkTime(ntpServerUrl, ntpClient.defaultNtpPort, function (err: any, date: Date) {
      if (err) {
        reject(err);
      } else {
        resolve(date);
      }
    });
  });
}

async function getCurrentMilliseconds(): Promise<number> {
  let curMS = new Date().valueOf();
  if (curMS === preMilliseconds) {
    return new Promise<number>((resolve, reject) =>
      setImmediate(() =>
        getCurrentMilliseconds()
          .then(r => resolve(r))
          .catch(reject)
      )
    );
  }

  preMilliseconds = curMS;
  return curMS - YearOneMS - offset;
}

const promiseArray = config.ntpServerUrlArray.map(x => getNTPTime(x));
Promise.allSettled(promiseArray).then(rs => {
  const filledRArray = rs.filter(x => x.status === 'fulfilled') as PromiseFulfilledResult<Date>[];
  if (filledRArray.length < 1) {
    console.error(`ntp server url were invalid:`, config.ntpServerUrlArray.join(','));
    process.exit(1);
  } else {
    const avrg = filledRArray.reduce((acc, cur) => acc + cur.value.valueOf(), 0) / filledRArray.length;
    const standardTime = new Date(avrg);
    offset = new Date().valueOf() - standardTime.valueOf();
    getNTPCompleted = true;
    console.log('标准时间：', standardTime);
  }
});

setTimeout(function () {
  if (!getNTPCompleted) {
    console.error(`Get standard time failed(timrout)`);
    process.emit('SIGINT', 'SIGINT');
  }
}, 5 * 1000);

async function generator(ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>, next: Koa.Next) {
  const currentMilliseconds = await getCurrentMilliseconds();
  let timeStr = currentMilliseconds.toString(2);
  if (timeStr.length > 41) {
    ctx.throw(500, 'InternalServerError');
  }
  timeStr = '0' + timeStr;
  const rst = numberStrArray.map(x => BigInt(`0b${timeStr}${serviceUniqueCode}${x}`).toString(10));
  ctx.body = rst;
}

export const router = new Router({ prefix: '/guid' });
router.get('/', generator);

export function registerHandlers(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
  app.use(koaBody());
  app.use(koaCompress());
  app.use(router.routes()).use(router.allowedMethods());
}
