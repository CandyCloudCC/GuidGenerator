export interface IConfig {
  /**
   * 服务监听地址
   */
  port: number;

  /**
   * Guid generator service unique code,以保证不同服务实例相同时间不会产生相同 id
   * 最小值 0, 最大值 255
   */
  serviceUniqueCode: number;

  /**
   * ntp 服务器地址列表，主要用于网络时间校准，以防止本机时间不正确导致出现重复的 id
   */
  ntpServerUrlArray: string[];

  /**
   * 访问授权码
   */
  accessToken: string[];
}
