// 工具函数
export * from './toDisplayString';
export const extend = Object.assign;

export const EMPTY_OBJ = {};

export const isObject = (val) => {
  return val !== null && typeof val === 'object';
};

export const isString = (value) => typeof value === 'string';

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

export const hasChanged = (value, oldValue) => {
  return !Object.is(value, oldValue);
};

export const hasOwn = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
// 转驼峰
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : '';
  });
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
};

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]';
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]';

export const objectToString = Object.prototype.toString;
export const toTypeString = (value: unknown): string =>
  objectToString.call(value);

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]';

export const NOOP = () => {};

export { ShapeFlags } from './ShapeFlags';
