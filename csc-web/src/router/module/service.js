const service = {
  ServiceSoftwareCreate: () => import('views/resource-apply/software.vue'),
  ServiceRedisCreate: () => import('views/resource-apply/redis.vue'),
  ServiceAzureMysqlCreate: () => import('views/resource-apply/mysql/index.vue'),
  ServiceAzureRedisCreate: () => import('views/resource-apply/redis/index.vue'),
  ServiceMongodbCreate: () => import('views/resource-apply/mongodb.vue'),
  ServiceVpcCreate: () => import('views/resource-apply/vpc/index.vue'),
  ServiceFloatIpCreate: () => import('views/resource-apply/fip/index.vue'),
  ServiceEcsCreate: () => import('views/resource-apply/ecs/index.vue'),
  ServiceServerCreate: () => import('views/resource-apply/server/index.vue'),
  ServiceDiskCreate: () => import('views/resource-apply/disk/index.vue'),
  ServiceLbCreate: () => import('views/resource-apply/lb/index.vue'),
  ServiceRabbitMqCreate: () => import('views/resource-apply/rabbitmq.vue'),
  ServiceOpsCreate: () => import('views/resource-apply/task/index.vue'),
  ServiceSnapshots: () => import('views/resource-apply/snapshot/index.vue')
}
export default service
