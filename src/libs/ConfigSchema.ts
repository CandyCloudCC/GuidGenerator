import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';

import { IConfig } from './IConfig';

const CONFIG_SCHEMA = {
  type: 'object',
  required: ['port', 'serviceUniqueCode', 'ntpServerUrlArray', 'accessToken'],
  properties: {
    port: {
      type: 'integer',
      description: '服务监听地址',
      minimum: 10000,
      maximum: 59999,
      examples: [21001]
    },
    serviceUniqueCode: {
      type: 'integer',
      description: 'Guid generator service unique code,以保证不同服务实例相同时间不会产生相同 id',
      minimum: 0,
      maximum: 255,
      examples: [0]
    },
    ntpServerUrlArray: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      description: 'ntp 服务器地址列表，主要用于网络时间校准，以防止本机时间不正确导致出现重复的 id',
      items: {
        type: 'string',
        format: 'hostname'
      },
      examples: [
        'time1.aliyun.com',
        'time2.aliyun.com',
        'time3.aliyun.com',
        'time4.aliyun.com',
        'time5.aliyun.com',
        'time6.aliyun.com',
        'time7.aliyun.com'
      ]
    },
    accessToken: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      description: '访问授权码',
      items: {
        type: 'string',
        minLength: 6,
        maxLength: 128
      }
    }
  }
};

/**
 * 配置文件格式校验,并配置默认值
 */
export function validateConfigStructure(config: IConfig): IConfig {
  let ajv = new Ajv({ allErrors: true });

  ajvFormats(ajv);

  let validate = ajv.compile(CONFIG_SCHEMA);
  let vRst = validate(config);
  if (!vRst) {
    let vErrors = JSON.stringify(validate.errors, null, 2);
    let errMsg = `The config is invalid.\nvalidate errors:\n${vErrors}`;
    throw new Error(errMsg);
  }

  return config;
}
