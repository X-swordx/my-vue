import { trackEffects, triggerEffects, isTracking  } from "./effect"
import { reactive } from "./reactive";
import { hasChanged, isObject } from "./shared";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    // 判断存在 activeEffect , 才收集依赖
    if(isTracking()) {
      trackEffects(this.dep)
    }
    return this._value
  }

  set value(newValue) {
    // 判断新值和旧值是否相同
    if(hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

// 看看 value 是不是对象，是则进行转换
function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}


export const ref = (value) => {
  return new RefImpl(value)
}

export const isRef = (ref) => {
  return !!ref.__v_isRef
}

export const unRef = (ref) => {
  return isRef(ref) ? ref.value : ref
}

