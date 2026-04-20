const ops = {
  ServiceTaskExecute: () => import('views/task/execute.vue'),
  ServiceTask: () => import('views/task/index.vue'),
  TaskHistory: () => import('views/task/history.vue'),
  TaskHistoryPreview: () => import('views/task/graph/executeDetail/index.vue')
}
export default ops
