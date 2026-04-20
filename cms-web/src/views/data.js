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
    name: 'CNWARE',
    value: 'MONITOR_CNWARE',
    vendorType: 'CNWARE',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_CNWARE_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_CNWARE_VM'
      },
      {
        name: '数据存储',
        value: 'MONITOR_CNWARE_DATASTORE'
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
    name: 'CloudTower',
    value: 'MONITOR_CLOUDTOWER',
    vendorType: 'CLOUDTOWER',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_CLOUDTOWER_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_CLOUDTOWER_VM'
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
    name: 'EasyStack',
    value: 'MONITOR_EASYSTACK',
    vendorType: 'EASYSTACK',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_EASYSTACK_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_EASYSTACK_VM'
      },
      {
        name: '服务',
        value: 'MONITOR_EASYSTACK_SERVICE'
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
    name: '天翼云',
    value: 'MONITOR_TIANYI',
    vendorType: 'TIANYI',
    data: [
      {
        name: '云主机',
        value: 'MONITOR_TIANYI_VM'
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
    name: '青云',
    value: 'MONITOR_QCLOUD',
    vendorType: 'QCLOUD',
    data: [
      {
        name: '云主机',
        value: 'MONITOR_QCLOUD_VM'
      }
    ]
  },
  {
    name: 'Azure',
    value: 'MONITOR_AZURE',
    vendorType: 'AZURE',
    data: [
      {
        name: '云主机',
        value: 'MONITOR_AZURE_VM'
      }
    ]
  },
  {
    name: '电子云',
    value: 'MONITOR_CECSTACK',
    vendorType: 'CECSTACK',
    data: [
      {
        name: '云主机',
        value: 'MONITOR_CECSTACK_VM'
      }
    ]
  },
  {
    name: '华为云',
    value: 'MONITOR_HUAWEI',
    vendorType: 'HUAWEI',
    data: [
      {
        name: '云主机',
        value: 'MONITOR_HUAWEI_VM'
      }
    ]
  },
  {
    name: '华三云',
    value: 'MONITOR_H3C',
    vendorType: 'H3C',
    data: [
      {
        name: '宿主机',
        value: 'MONITOR_H3C_HOST'
      },
      {
        name: '云主机',
        value: 'MONITOR_H3C_VM'
      }
    ]
  },
  {
    name: 'Dell存储',
    value: 'MONITOR_STORAGE_DELL',
    vendorType: 'SMIS_STORAGE',
    data: [
      {
        name: '存储设备',
        value: 'MONITOR_STORAGE_DELL_STORAGE'
      },
      {
        name: '磁盘',
        value: 'MONITOR_STORAGE_DELL_DISK'
      },
      {
        name: '存储卷',
        value: 'MONITOR_STORAGE_DELL_VOLUME'
      }
    ]
  },
  {
    name: 'Kubernetes',
    value: 'MONITOR_KUBERNETES',
    data: [
      {
        name: '节点',
        value: 'MONITOR_KUBERNETES_NODE'
      },
      {
        name: '窗口组',
        value: 'MONITOR_KUBERNETES_POD'
      }
    ]
  },
  {
    name: 'HMC',
    value: 'MONITOR_HMC',
    data: [
      {
        name: '主机',
        value: 'MONITOR_HMC_SERVER'
      },
      {
        name: 'VIOS',
        value: 'MONITOR_HMC_VIOS'
      },
      {
        name: '逻辑分区',
        value: 'MONITOR_HMC_AIX'
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
  },
  {
    name: 'XSKY',
    value: 'MONITOR_XSKY',
    data: [
      {
        name: '服务器',
        value: 'MONITOR_XSKY_HOST'
      },
      {
        name: '对象用户',
        value: 'MONITOR_XSKY_OBJECT_USER'
      },
      {
        name: '对象路由',
        value: 'MONITOR_XSKY_OBJECT_ROUTER'
      },
      {
        name: '存储桶',
        value: 'MONITOR_XSKY_OBJECT_BUCKET'
      },
      {
        name: '块存储卷',
        value: 'MONITOR_XSKY_VOLUME'
      },
      {
        name: '存储池',
        value: 'MONITOR_XSKY_VOLUME_POOL'
      },
      {
        name: '硬盘',
        value: 'MONITOR_XSKY_CEPH_OSD'
      },
      {
        name: '缓存',
        value: 'MONITOR_XSKY_DISK'
      },
      {
        name: '文件系统',
        value: 'MONITOR_XSKY_FILESYSTEM'
      }
    ]
  }
]
export const resourceList = [
  {
    name: 'vSphere宿主机',
    value: 'MONITOR_VCENTER_HOST',
    type: 'VMWARE'
  },
  {
    name: 'AZURE云主机',
    value: 'MONITOR_AZURE_VM',
    type: 'AZURE'
  },
  {
    name: 'vSphere云主机',
    value: 'MONITOR_VCENTER_VM',
    type: 'VMWARE'
  },
  {
    name: 'vSphere数据存储',
    value: 'MONITOR_VCENTER_DATASTORE',
    type: 'VMWARE'
  },
  {
    name: '云宏宿主机',
    value: 'MONITOR_CNWARE_HOST',
    type: 'CNWARE'
  },
  {
    name: '云宏云主机',
    value: 'MONITOR_CNWARE_VM',
    type: 'CNWARE'
  },
  {
    name: '云宏数据存储',
    value: 'MONITOR_CNWARE_DATASTORE',
    type: 'CNWARE'
  },
  {
    name: 'FUSIONSPHERE宿主机',
    value: 'MONITOR_FUSIONSPHERE_HOST',
    type: 'FUSIONSPHERE'
  },
  {
    name: 'FUSIONSPHERE云主机',
    value: 'MONITOR_FUSIONSPHERE_VM',
    type: 'FUSIONSPHERE'
  },
  {
    name: '浪潮云宿主机',
    value: 'MONITOR_INSPUR_RAIL_HOST',
    type: 'INSPURRAIL'
  },
  {
    name: '浪潮云云主机',
    value: 'MONITOR_INSPUR_RAIL_VM',
    type: 'INSPURRAIL'
  },
  {
    name: 'CloudTower宿主机',
    value: 'MONITOR_CLOUDTOWER_HOST',
    type: 'CLOUDTOWER'
  },
  {
    name: 'CloudTower云主机',
    value: 'MONITOR_CLOUDTOWER_VM',
    type: 'CLOUDTOWER'
  },
  {
    name: '深信服HCI宿主机',
    value: 'MONITOR_SANGFOR_HCI_HOST',
    type: 'SANGFOR'
  },
  {
    name: '深信服HCI云主机',
    value: 'MONITOR_SANGFOR_HCI_VM',
    type: 'SANGFOR'
  },
  {
    name: '深信服SCP宿主机',
    value: 'MONITOR_SANGFOR_SCP_HOST',
    type: 'SANGFOR'
  },
  {
    name: '深信服SCP云主机',
    value: 'MONITOR_SANGFOR_SCP_VM',
    type: 'SANGFOR'
  },
  {
    name: 'ZSTACK云主机',
    value: 'MONITOR_ZSTACK_VM',
    type: 'ZSTACK'
  },
  {
    name: 'ZSTACK宿主机',
    value: 'MONITOR_ZSTACK_HOST',
    type: 'ZSTACK'
  },
  {
    name: 'OpenStack宿主机',
    value: 'MONITOR_OPENSTACK_HOST',
    type: 'OPENSTACK'
  },
  {
    name: 'OpenStack云主机',
    value: 'MONITOR_OPENSTACK_VM',
    type: 'OPENSTACK'
  },
  {
    name: 'EasyStack宿主机',
    value: 'MONITOR_EASYSTACK_HOST',
    type: 'EASYSTACK'
  },
  {
    name: 'EasyStack云主机',
    value: 'MONITOR_EASYSTACK_VM',
    type: 'EASYSTACK'
  },
  {
    name: 'ManageOne宿主机',
    value: 'MONITOR_FUSIONCLOUD_HOST',
    type: 'MANAGEONE'
  },
  {
    name: 'ManageOne云主机',
    value: 'MONITOR_FUSIONCLOUD_VM',
    type: 'MANAGEONE'
  },
  {
    name: '天翼云ECS',
    value: 'MONITOR_TIANYI_VM',
    type: 'TIANYI'
  },
  {
    name: '阿里云ECS',
    value: 'MONITOR_ALIYUN_VM',
    type: 'ALIYUN'
  },
  {
    name: '青云ECS',
    value: 'MONITOR_QCLOUD_VM',
    type: 'QCLOUD'
  },
  {
    name: '电子云ECS',
    value: 'MONITOR_CECSTACK_VM',
    type: 'CECSTACK'
  },
  {
    name: '华为云ECS',
    value: 'MONITOR_HUAWEI_VM',
    type: 'HUAWEI'
  },
  {
    name: 'H3C主机',
    value: 'MONITOR_H3C_HOST',
    type: 'H3C'
  },
  {
    name: 'H3C云主机',
    value: 'MONITOR_H3C_VM',
    type: 'H3C'
  },
  {
    name: 'SMARTX云主机',
    value: 'MONITOR_SMARTX_VM',
    type: 'SMARTX'
  },
  {
    name: 'SMARTX宿主机',
    value: 'MONITOR_SMARTX_HOST',
    type: 'SMARTX'
  },
  {
    name: 'Dell存储设备',
    value: 'MONITOR_STORAGE_DELL_STORAGE',
    type: 'SMIS_STORAGE',
    projectName: 'DELL'
  },
  {
    name: 'Dell磁盘',
    value: 'MONITOR_STORAGE_DELL_DISK',
    type: 'SMIS_STORAGE',
    projectName: 'DELL'
  },
  {
    name: 'Dell存储卷',
    value: 'MONITOR_STORAGE_DELL_VOLUME',
    type: 'SMIS_STORAGE',
    projectName: 'DELL'
  },
  // {
  //   name: '华为存储设备',
  //   value: 'MONITOR_STORAGE_HUAWEI_STORAGE',
  //   type: 'SMIS_STORAGE',
  //   projectName: 'HUA_WEI'
  // },
  // {
  //   name: '华为磁盘',
  //   value: 'MONITOR_STORAGE_HUAWEI_DISK',
  //   type: 'SMIS_STORAGE',
  //   projectName: 'HUA_WEI'
  // },
  // {
  //   name: '华为存储卷',
  //   value: 'MONITOR_STORAGE_HUAWEI_VOLUME',
  //   type: 'SMIS_STORAGE',
  //   projectName: 'HUA_WEI'
  // },
  {
    name: 'Kubernetes节点',
    value: 'MONITOR_KUBERNETES_NODE',
    type: 'KUBERNETES'
  },
  {
    name: 'Kubernetes容器组',
    value: 'MONITOR_KUBERNETES_POD',
    type: 'KUBERNETES'
  },
  {
    name: 'HMC主机',
    value: 'MONITOR_HMC_SERVER',
    type: 'HMC'
  },
  {
    name: 'HMC VIOS',
    value: 'MONITOR_HMC_VIOS',
    type: 'HMC'
  },
  {
    name: 'HMC逻辑分区',
    value: 'MONITOR_HMC_AIX',
    type: 'HMC'
  },
  {
    name: '思科交换机',
    value: 'MONITOR_CISCO_SANFABRIC',
    type: 'SMIS_FABRIC'
  },
  {
    name: '云数据库 MySQL',
    value: 'MONITOR_RDS_MYSQL',
    type: 'mysql'
  },
  // {
  //   name: '云数据库 SQL Server',
  //   value: 'MONITOR_RDS_SQLSERVER',
  //   type: 'sqlserver'
  // },
  {
    name: '云数据库 PostGreSQL',
    value: 'MONITOR_RDS_POSTGRESQL',
    type: 'postgresql'
  },
  {
    name: '云数据库 Oracle',
    value: 'MONITOR_RDS_ORACLE',
    type: 'oracle'
  },
  {
    name: '云数据库 Redis',
    value: 'MONITOR_KVS_REDIS',
    type: 'redis'
  },
  {
    name: '云数据库 Mongodb',
    value: 'MONITOR_KVS_MONGODB',
    type: 'mongodb'
  },
  {
    name: '云数据库 MemCached',
    value: 'MONITOR_KVS_MEMCACHED',
    type: 'memchache'
  },
  {
    name: '消息队列 Kafka',
    value: 'MONITOR_CMS_KAFKA',
    type: 'kafka'
  },
  {
    name: '消息队列 RabbitMQ',
    value: 'MONITOR_CMS_RABBITMQ',
    type: 'rabbitmq'
  },
  {
    name: '配置中心 Zookeeper',
    value: 'MONITOR_CCS_ZOOKEEPER',
    type: 'zookeeper'
  },
  {
    name: '配置中心 Etcd',
    value: 'MONITOR_CCS_ETCD',
    type: 'etcd'
  },
  {
    name: 'XSKY服务器',
    value: 'MONITOR_XSKY_HOST',
    type: 'XSKY'
  },
  {
    name: 'XSKY对象用户',
    value: 'MONITOR_XSKY_OBJECT_USER',
    type: 'XSKY'
  },
  {
    name: 'XSKY对象路由',
    value: 'MONITOR_XSKY_OBJECT_ROUTER',
    type: 'XSKY'
  },
  {
    name: 'XSKY存储桶',
    value: 'MONITOR_XSKY_OBJECT_BUCKET',
    type: 'XSKY'
  },
  {
    name: 'XSKY块存储卷',
    value: 'MONITOR_XSKY_VOLUME',
    type: 'XSKY'
  },
  {
    name: 'XSKY存储池',
    value: 'MONITOR_XSKY_VOLUME_POOL',
    type: 'XSKY'
  },
  {
    name: 'XSKY硬盘',
    value: 'MONITOR_XSKY_CEPH_OSD',
    type: 'XSKY'
  },
  {
    name: 'XSKY缓存',
    value: 'MONITOR_XSKY_DISK',
    type: 'XSKY'
  },
  {
    name: 'XSKY文件系统',
    value: 'MONITOR_XSKY_FILESYSTEM',
    type: 'XSKY'
  },
  {
    name: '青云（云易捷）ECS',
    value: 'MONITOR_YYJQCLOUD_VM',
    type: 'YYJQCLOUD'
  }
]
export const getCategory = (value) => {
  if (!value) return []
  const result = catalogList.find((item) => item.value === value)
  return result.data
}
export const getVendorType = (value) => {
  if (!value) return []
  const result = resourceList.find((item) => item.value === value)
  return result.type
}
export const getProjectName = (value) => {
  if (!value) return []
  const result = resourceList.find((item) => item.value === value)
  return result.projectName
}
export const getResourceType = (value) => {
  if (!value) return []
  const result = resourceList.find((item) => item.type === value)
  return result.value
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
    prop: 'memTotal',
    scopedSlots: { customRender: 'memTotal' }
  },
  // {
  //   label: '通断状态',
  //   prop: 'onOffStatus',
  //   scopedSlots: { customRender: 'onOffStatus' }
  // },
  // {
  //   label: '响应时长',
  //   prop: 'responseTime',
  //   scopedSlots: { customRender: 'responseTime' }
  // },
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
      http(params).then((data) => {
        if (data.success) {
          self.$message({
            type: 'success',
            message: data.message
          })
          self.getList()
        }
      })
    })
    .catch(() => { })
}
