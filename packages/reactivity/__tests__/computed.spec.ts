import { computed } from '../src/computed';
import { reactive } from '../src/reactive';
import { vi } from 'vitest';
describe('computed', () => {
  it('happy path', () => {
    // 接受一个 getter 函数，并根据 getter 的返回值返回一个不可变的响应式 ref 对象
    const user = reactive({
      age: 1,
    });
    const age = computed(() => user.age);

    expect(age.value).toBe(1);
  });

  it('should compute lazily', () => {
    const value = reactive({
      foo: 1,
    });
    const getter = vi.fn(() => value.foo);
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);
    // should not compute until needed
    value.foo = 2; // 触发 trigger -> 收集 effect -> get 重新执行 effect
    expect(getter).toHaveBeenCalledTimes(1);
    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it('warn then call set', () => {
    console.warn = vi.fn();
    const value = reactive({
      foo: 1,
    });
    const getter = vi.fn(() => value.foo);
    const cValue = computed(getter);
    cValue.value++;
    expect(console.warn).toBeCalled();
  });
});
