export default {
  PmResourceManage: () => import('views/resource-manage/host/host.vue'),
  VmResourceManage: () => import('views/resource-manage/host/host.vue'),
  NetworkGroupManage: () => import('views/resource-manage/group/network.vue'),
  WorkerGroupManage: () => import('views/resource-manage/group/worker.vue'),
  ResourceServerConfig: () => import('views/resource-manage/host/serverConfig.vue')
}
