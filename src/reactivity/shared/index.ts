// 工具函数
export const extend = Object.assign

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}