import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if(this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }

  set value(newValue) {
    console.warn(`computed value can't be set`);
  }
}

export function computed(getter: () => any) {
  return new ComputedRefImpl(getter);
}