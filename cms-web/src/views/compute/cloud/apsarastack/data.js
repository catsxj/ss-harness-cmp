export const vmData = {
  ECS操作系统监控: [
    { value: 'apsarastack_ecs_cpu_total_average' },
    { value: 'apsarastack_ecs_memory_usedutilization_average' },
    { value: 'apsarastack_ecs_load_1m_average' },
    { value: 'apsarastack_ecs_load_5m_average' },
    { value: 'apsarastack_ecs_load_15m_average' },
    { value: 'apsarastack_ecs_diskusage_utilization_average' },
    { value: 'apsarastack_ecs_disk_writebytes_average' },
    { value: 'apsarastack_ecs_disk_readbytes_average' },
    { value: 'apsarastack_ecs_disk_writeiops_average' },
    { value: 'apsarastack_ecs_disk_readiops_average' },
    { value: 'apsarastack_ecs_fs_inodeutilization_average' },
    { value: 'apsarastack_ecs_net_tcpconnection_average' }
  ],
  ECS基础监控: [
    { value: 'apsarastack_ecs_CPUUtilization_average' },
    { value: 'apsarastack_ecs_IntranetInRate_average' },
    { value: 'apsarastack_ecs_InternetInRate_average' },
    { value: 'apsarastack_ecs_InternetOutRate_average' },
    { value: 'apsarastack_ecs_IntranetOutRate_average' },
    { value: 'apsarastack_ecs_DiskReadBPS_average' },
    { value: 'apsarastack_ecs_DiskWriteBPS_average' },
    { value: 'apsarastack_ecs_DiskReadIOPS_average' },
    { value: 'apsarastack_ecs_DiskWriteIOPS_average' }
  ]
}

export const rdsData = {
  RDS监控: [
    { value: 'apsarastack_rds_CpuUsage_average' },
    { value: 'apsarastack_rds_MemoryUsage_average' },
    { value: 'apsarastack_rds_DiskUsage_average' },
    { value: 'apsarastack_rds_IOPSUsage_average' },
    { value: 'apsarastack_rds_ConnectionUsage_average' },
    { value: 'apsarastack_rds_MySQL_NetworkInNew_average' },
    { value: 'apsarastack_rds_MySQL_NetworkOutNew_average' },
    { value: 'apsarastack_rds_MySQL_QPS_average' },
    { value: 'apsarastack_rds_DockerCpuUsage_average' }
  ]
}
