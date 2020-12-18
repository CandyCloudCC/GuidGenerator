import _ from 'lodash';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';
import koaCompress from 'koa-compress';
const ntpClient = require('ntp-client');

import { isDebugMode } from './utils';

import { config } from '../config';

let offset = 0;
let preMilliseconds = 0;
let getNTPCompleted = false;
const serviceUniqueCode = _.padStart(config.serviceUniqueCode.toString(2), 8, '0');

/**
 * 缓存数据大小
 */
const maxCacheCount = 10 * 10000;
const maxCountInBatch = 2 * 10000;
const cacheIdArray: string[] = [];

/**
 * 以 2020 年为基准元年，那么 41 位整数所表达得有效年份有约 69 年
 */
const YearOneMS = new Date('Jan 01 2020 GMT').valueOf();
const numberStrArray: string[] = [];
for (let i = 0; i < 2 ** 14; i++) {
  numberStrArray.push(_.padStart(i.toString(2), 14, '0'));
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
      setTimeout(function nextMilliseconds() {
        getCurrentMilliseconds()
          .then(r => resolve(r))
          .catch(reject);
      }, 1)
    );
  }

  preMilliseconds = curMS;
  return curMS - offset - YearOneMS;
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

    setTimeout(fillCacheId, 1);
  }
});

setTimeout(function () {
  if (!getNTPCompleted) {
    console.error(`Get standard time failed(timrout)`);
    process.emit('SIGINT', 'SIGINT');
  }
}, 5 * 1000);

async function fillCacheId() {
  if (isDebugMode()) {
    console.log(`${new Date().toISOString()} : 当前缓存 id 数量 : ${cacheIdArray.length}`);
  }

  if (cacheIdArray.length > maxCacheCount) {
    return;
  }

  const currentMilliseconds = await getCurrentMilliseconds();
  const timeStr = `0${currentMilliseconds.toString(2)}`;
  const idArray = numberStrArray.map(x => BigInt(`0b${timeStr}${serviceUniqueCode}${x}`).toString(10));
  cacheIdArray.splice(cacheIdArray.length, 0, ...idArray);

  await fillCacheId();
}

async function generator(ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>, next: Koa.Next) {
  const accessToken = ctx.query.access_token;
  let count = parseInt(ctx.query.count);
  if (_.isEmpty(accessToken) || !_.isNumber(count)) {
    ctx.throw(400, 'Bad Request');
  }

  if (!config.accessToken.includes(accessToken)) {
    ctx.throw(403, 'Forbidden');
  }

  if (count > maxCountInBatch) {
    count = maxCountInBatch;
  }

  if (cacheIdArray.length < count) {
    await fillCacheId();
  }

  ctx.body = cacheIdArray.splice(0, count);

  setTimeout(fillCacheId, 1);
}

export const router = new Router({ prefix: '/guid' });
router.get('/', generator);

export function registerHandlers(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
  app.use(koaBody());
  app.use(koaCompress());
  app.use(router.routes()).use(router.allowedMethods());
}
