// 工具函数
export const extend = Object.assign

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const hasOwn = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export const hasChanged = (value, oldValue) => {
  return !Object.is(value, oldValue)
}

export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'

export const NOOP = () => { }