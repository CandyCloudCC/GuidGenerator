export function isDebugMode() {
  const NE = (process.env || {})['NODE_ENV'];
  const rst = String(NE).toLowerCase() === 'debug';
  return rst;
}
