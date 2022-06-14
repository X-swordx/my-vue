import { reactive } from "../reactive"
import { effect } from "../effect"

describe("effect", () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    // update
    user.age ++
    expect(nextAge).toBe(12)
  })

  it('当调用 effect 时返回 runner', () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)
    const r = runner()
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    // 1. 通过 effect 第二个参数传入 一个 scheduler 的 fn
    // 2. effect 第一次执行的时候 还会执行 effect回调函数
    // 3. 但响应式数据 更新 的时候不会执行 effect回调函数 , 而是执行 scheduler
    // 4. 如果说当执行 runner 的时候，会再次的执行 effect回调函数
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    })
    const obj = reactive({
      foo: 1
    });
    const runner = effect(
      () => {
        dummy = obj.foo
      }, 
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // 更新
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    // 再次运行 runner，effect fn 也会再次执行
    run()
    expect(dummy).toBe(2)
  })
})