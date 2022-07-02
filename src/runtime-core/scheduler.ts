const queue: any[] = []
// 优先用微任务，vue中采用了优雅降级，如果微任务都不支持，就用宏任务兜底
const p = Promise.resolve()
let isFlushPending = false

export function nextTick(fn) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}

function queueFlush() {
  if(isFlushPending) return
  isFlushPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false
  let job
  while (job = queue.shift()) {
    job && job()
  }
}
