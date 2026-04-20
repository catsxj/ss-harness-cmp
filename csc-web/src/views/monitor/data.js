import { modifyAlarmStatus, deleteAlarmStatus } from 'services/monitor/index.js'
export const catalogList = [
  {
    name: 'vCenter',
    value: 'MONITOR_VCENTER',
    vendorType: 'VMWARE',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_VCENTER_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_VCENTER_VM'
      },
      {
        name: '数据存储',
        value: 'MONITOR_VCENTER_DATASTORE'
      }
    ]
  },
  {
    name: 'InspurRail',
    value: 'MONITOR_INSPUR_RAIL',
    vendorType: 'INSPURRAIL',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_INSPUR_RAIL_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_INSPUR_RAIL_VM'
      },
      {
        name: '数据存储',
        value: 'MONITOR_INSPUR_RAIL_DATASTORE'
      }
    ]
  },
  {
    name: 'OpenStack',
    value: 'MONITOR_OPENSTACK',
    vendorType: 'OPENSTACK',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_OPENSTACK_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_OPENSTACK_VM'
      },
      {
        name: '服务',
        value: 'MONITOR_OPENSTACK_SERVICE'
      }
    ]
  },
  {
    name: 'ManageOne',
    value: 'MONITOR_FUSIONCLOUD',
    vendorType: 'OPENSTACK',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_FUSIONCLOUD_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_FUSIONCLOUD_VM'
      }
    ]
  },
  {
    name: '阿里云',
    value: 'MONITOR_ALIYUN',
    vendorType: 'ALIYUN',
    data: [
      {
        name: '云主机',
        value: 'MONITOR_ALIYUN_VM'
      }
    ]
  },
  {
    name: '关系型数据库',
    value: 'MONITOR_RDS',
    data: [
      {
        name: 'MySQL',
        value: 'MONITOR_RDS_MYSQL'
      },
      {
        name: 'SQL Server',
        value: 'MONITOR_RDS_SQLSERVER'
      },
      {
        name: 'PostGreSQL',
        value: 'MONITOR_RDS_POSTGRESQL'
      },
      {
        name: 'Oracle',
        value: 'MONITOR_RDS_ORACLE'
      }
    ]
  },
  {
    name: 'NoSQL数据库',
    value: 'MONITOR_KVS',
    data: [
      {
        name: 'Redis',
        value: 'MONITOR_KVS_REDIS'
      },
      {
        name: 'Mongodb',
        value: 'MONITOR_KVS_MONGODB'
      },
      {
        name: 'MemCached',
        value: 'MONITOR_KVS_MEMCACHED'
      }
    ]
  },
  {
    name: '消息队列',
    value: 'MONITOR_CMS',
    data: [
      {
        name: 'Kafka',
        value: 'MONITOR_CMS_KAFKA'
      },
      {
        name: 'RabbitMQ',
        value: 'MONITOR_CMS_RABBITMQ'
      }
    ]
  },
  {
    name: '配置中心',
    value: 'MONITOR_CCS',
    data: [
      {
        name: 'Zookeeper',
        value: 'MONITOR_CCS_ZOOKEEPER'
      },
      {
        name: 'Etcd',
        value: 'MONITOR_CCS_ETCD'
      }
    ]
  }
]
export const resourceList = [
  // {
  //   name: 'vSphere宿主机',
  //   value: 'MONITOR_VCENTER_HOST',
  //   type: 'VMWARE'
  // },
  {
    name: 'vSphere云主机',
    value: 'MONITOR_VCENTER_VM',
    type: 'VMWARE'
  },
  // {
  //   name: 'vSphere数据存储',
  //   value: 'MONITOR_VCENTER_DATASTORE',
  //   type: 'VMWARE'
  // },
  // {
  //   name: 'OpenStack宿主机',
  //   value: 'MONITOR_OPENSTACK_HOST',
  //   type: 'OPENSTACK'
  // },
  {
    name: 'OpenStack云主机',
    value: 'MONITOR_OPENSTACK_VM',
    type: 'OPENSTACK'
  },
  // {
  //   name: 'OpenStack服务',
  //   value: 'MONITOR_OPENSTACK_SERVICE',
  //   type: 'OPENSTACK'
  // },
  // {
  //   name: 'ManageOne宿主机',
  //   value: 'MONITOR_FUSIONCLOUD_HOST',
  //   type: 'FUSIONCLOUD'
  // },
  // {
  //   name: 'ManageOne云主机',
  //   value: 'MONITOR_FUSIONCLOUD_VM',
  //   type: 'FUSIONCLOUD'
  // },
  {
    name: '阿里云ECS',
    value: 'MONITOR_ALIYUN_VM',
    type: 'ALIYUN'
  },
  {
    name: '华为云ECS',
    value: 'MONITOR_HUAWEI_VM',
    type: 'HUAWEI'
  },
  {
    name: 'SMARTX云主机',
    value: 'MONITOR_SMARTX_VM',
    type: 'SMARTX'
  },
  {
    name: 'CLOUDTOWER云主机',
    value: 'MONITOR_CLOUDTOWER_VM',
    type: 'CLOUDTOWER'
  },
  {
    name: 'ZSTACK云主机',
    value: 'MONITOR_ZSTACK_VM',
    type: 'ZSTACK'
  },
  {
    name: 'CNWARE云主机',
    value: 'MONITOR_CNWARE_VM',
    type: 'CNWARE'
  },
  {
    name: '云数据库 MySQL',
    value: 'MONITOR_RDS_MYSQL',
    type: 'MySQL'
  },
  // {
  //   name: '云数据库 SQL Server',
  //   value: 'MONITOR_RDS_SQLSERVER',
  //   type: 'sqlserver'
  // },
  {
    name: '云数据库 PostGreSQL',
    value: 'MONITOR_RDS_POSTGRESQL',
    type: 'PostgreSQL'
  },
  // {
  //   name: '云数据库 Oracle',
  //   value: 'MONITOR_RDS_ORACLE',
  //   type: 'oracle'
  // },
  {
    name: '云数据库 Redis',
    value: 'MONITOR_KVS_REDIS',
    type: 'Redis'
  },
  {
    name: '云数据库 Mongodb',
    value: 'MONITOR_KVS_MONGODB',
    type: 'MongoDB'
  },
  // {
  //   name: '云数据库 MemCached',
  //   value: 'MONITOR_KVS_MEMCACHED',
  //   type: 'memchache'
  // },
  {
    name: '消息队列 Kafka',
    value: 'MONITOR_CMS_KAFKA',
    type: 'Kafka'
  },
  {
    name: '消息队列 RabbitMQ',
    value: 'MONITOR_CMS_RABBITMQ',
    type: 'RabbitMQ'
  }
  // {
  //   name: '配置中心 Zookeeper',
  //   value: 'MONITOR_CCS_ZOOKEEPER',
  //   type: 'zookeeper'
  // },
  // {
  //   name: '配置中心 Etcd',
  //   value: 'MONITOR_CCS_ETCD',
  //   type: 'etcd'
  // }
]
export const getCategory = value => {
  if (!value) return []
  const result = catalogList.find(item => item.value === value)
  return result.data
}
export const getVendorType = value => {
  if (!value) return []
  const result = resourceList.find(item => item.value === value)
  return result.type
}
export const getResourceType = value => {
  if (!value) return []
  const result = resourceList.find(item => item.type === value)
  return result.value
}
export const getProjectName = value => {
  if (!value) return []
  const result = resourceList.find(item => item.value === value)
  return result.projectName
}
export const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '版本',
    prop: 'version'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '服务地址',
    prop: 'address'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '过期时间',
    prop: 'expiredTime',
    scopedSlots: { customRender: 'expiredTime' }
  },
  {
    label: '所属租户',
    prop: 'tenantName'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
export function customColorMethod(percentage) {
  if (Number(percentage) < 80) {
    return '#66c23a'
  } else if (Number(percentage) > 80 && Number(percentage) < 90) {
    return '#e6a23b'
  } else {
    // > 90
    return '#e96b6b'
  }
}
export const vmColumns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: 'IP地址',
    prop: 'privateIps',
    scopedSlots: { customRender: 'privateIps' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: 'CPU利用率',
    prop: 'cpuUsage',
    scopedSlots: { customRender: 'cpuUsage' }
  },
  {
    label: '内存利用率',
    prop: 'memUsage',
    scopedSlots: { customRender: 'memUsage' }
  },
  {
    label: '总内存(GB)',
    prop: 'memTotal'
  },
  {
    label: '通断状态',
    prop: 'onOffStatus',
    scopedSlots: { customRender: 'onOffStatus' }
  },
  {
    label: '响应时长',
    prop: 'responseTime',
    scopedSlots: { customRender: 'responseTime' }
  },
  {
    label: '所属租户',
    prop: 'tenantName'
  },
  // {
  //   label: '策略状态',
  //   prop: 'alarmEnable'
  // },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
export function handleStart(self, data, resourceType) {
  self
    .$confirm(`您确定要${data.alarmEnable ? '屏蔽' : '开启'}告警吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      let http
      if (data.alarmEnable) {
        http = deleteAlarmStatus
      } else {
        http = modifyAlarmStatus
      }
      const params = {
        resourceId: data.id,
        resourceType: resourceType
      }
      http(params).then(data => {
        if (data.success) {
          self.$message({
            type: 'success',
            message: data.message
          })
          self.getList()
        }
      })
    })
    .catch(() => {})
}
