import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'
export const GEN_UUID = () => nanoid(8)
const defaultCpu = 1
const defaultMemory = 1
const defaultSysDisk = 50

export const subApplicationParam = {
  taskGroupUuid: GEN_UUID(),
  taskTargetUuid: GEN_UUID(),
  networkRelations: [],
  imageData: {},
  osList: [],
  versionList: [],
  subLocation: {
    region: '',
    az: '',
    vendorId: '',
    poolGroupId: '',
    vendorType: '',
    purpose: '',
    remark: ''
  },
  emption: {
    duration: {
      mode: 'Hour',
      amount: 1
    },
    count: 1
  },
  configs: {
    // 云主机信息相关
    name: '',
    nameRuleId: '',
    vmHostName: process.env.NODE_ENV === 'development' ? 'localTest' : '',
    password: '',
    confirm_password: '',

    // 镜像相关
    osCategory: '',
    osVersion: '',
    imageId: '',
    templateDisk: '', // 前端用

    // 规格相关
    categoryId: '',
    cpu: defaultCpu,
    memory: defaultMemory,

    // 系统盘
    sysDisk: {
      categoryId: '',
      cloudCategory: '',
      disk: defaultSysDisk
    },
    // 数据盘
    addDiskList: [],

    // 网卡相关
    networkCardConfigs: [
      {
        networkCardId: '',
        ipPolicy: 'Manual',
        ipPoolId: '',
        ipPoolName: '',
        portGroupId: '',
        address: [],
        mask: '',
        gateway: '',
        dns: ''
      }
    ],

    // 公有云相关
    flavorId: '',
    groups: [],
    vpcId: '',
    vpcName: '',
    subnetId: '',
    subnetName: ''
  },
  preview: {
    hosts: []
  },
  groupList: [],
  vpcList: [],
  subnetList: [],
  elements: [
    {
      isLoadData: true,
      serviceCode: '',
      categoryId: '',
      category: '',
      specs: [
        {
          cpu: defaultCpu
        },
        {
          memory: defaultMemory
        }
      ],
      serviceItem: {}
    },
    {
      isLoadData: true,
      serviceCode: '',
      categoryId: '',
      category: '',
      specs: [
        {
          disk: defaultSysDisk
        }
      ],
      serviceItem: {}
    }
  ],
  service: ''
}
export const addNew = {
  workOrderTypeCode: 'CloudServerApplication', // 工单类型编号
  preview: {
    // 是否开启软件安装/支付方式都是租户的设置,所以申请时保存起来,在管理端直接使用
    isInstallSoftware: false,
    paymentMode: ['Hour', 'Month'],
    vendorType: ''
  },
  location: {
    name: '',
    businessId: '',
    businessName: '',
    projectId: '',
    projectName: '',
    creatorId: '',
    creatorName: '',
    menderId: '',
    menderName: '',
    ownerId: '',
    ownerName: '',
    tenantId: '',
    remark: ''
  },
  subApplicationParams: [cloneDeep(subApplicationParam)],
  tasks: [],
  emption: {
    duration: {
      mode: 'Hour',
      amount: '1'
    }
  }
}
export const addSnapshot = {
  workOrderTypeCode: 'SnapshotApplication', // 工单类型编号
  resourceCategory: 'Snapshot',
  location: {
    name: '',
    creatorId: '',
    creatorName: '',
    tenantId: '',
    remark: ''
  },
  snapshotApplicationParams: []
}
export const defaultTask = {
  sceneId: '',
  templateId: '',
  taskGroupUuid: '',
  taskName: '',
  taskCode: 'standard'
}
export const ServiceCodeMap = {
  server: {
    VMWARE: 'vmware.standard.server',
    CNWARE: 'cnware.standard.server',
    ZSTACK: 'zstack.standard.server',
    CLOUDTOWER: 'cloudtower.standard.server',
    SANGFOR: 'sangfor.standard.server',
    CECSTACK: 'cecstack.standard.server',
    INSPURRAIL: 'inspurrail.standard.server',
    H3C: 'h3c.standard.server',
    QCLOUD: 'qcloud.standard.server',
    HUAWEI: 'huawei.standard.server',
    ALIYUN: 'aliyun.standard.server',
    MANAGEONE: 'manageone.standard.server',
    SMARTX: 'smartx.standard.server',
    SUGONCLOUD: 'sugoncloud.standard.server',
    USPHERE: 'usphere.standard.server',
    LENOVO: 'lenovo.standard.server'
  },
  disk: {
    VMWARE: 'vmware.storage.disk',
    CNWARE: 'cnware.standard.volume',
    ZSTACK: 'zstack.storage.disk',
    CLOUDTOWER: 'cloudtower.standard.volume',
    SANGFOR: 'sangfor.storage.disk',
    CECSTACK: 'cecstack.standard.volume',
    INSPURRAIL: 'inspurrail.standard.volume',
    H3C: 'h3c.standard.volume',
    QCLOUD: 'qcloud.standard.volume',
    HUAWEI: 'huawei.standard.volume',
    ALIYUN: 'aliyun.standard.volume',
    MANAGEONE: 'manageone.standard.volume',
    SMARTX: 'smartx.standard.volume',
    SUGONCLOUD: 'sugoncloud.standard.volume',
    USPHERE: 'usphere.standard.volume',
    LENOVO: 'lenovo.standard.volume'
  }
}
export const subServerApplicationParam = {
  subLocation: {
    region: '',
    az: '',
    vendorId: '',
    poolGroupId: '',
    vendorType: '',
    purpose: '',
    remark: ''
  },
  emption: {
    duration: {
      mode: 'Hour',
      amount: '1'
    },
    count: 1
  },
  configs: {
    serverSpecId: '',
    cpuFramework: '',
    cpuHz: '',
    cpuNum: '',
    cpuSpecId: '',
    cpuPrice: 0,
    memHz: '',
    memSpecId: '',
    memPrice: 0,
    memSize: '',
    os: '',
    osPrice: 0,
    disks: [{ type: '', size: '', price: 0 }],
    networkCards: [{ id: '' }],
    model: '',
    otherParts: [{ id: '', price: 0 }]
  },
  preview: {
    cpuSlotCount: 0,
    memSlotCount: 0,
    uCount: 0,
    pciSlotCount: 0,
    powerInterfaceCount: 0,
    diskSlotCount: 0,
    brandName: '',
    deviceType: '',
    uniqueId: '',
    roomId: '',
    rackId: '',
    company: '',
    year: '',
    warrantyYear: '',
    pn: '',
    sn: '',
    power: '',
    useYear: '',
    ilo: '',
    shelfTime: ''
  },
  service: 'physical.standard.server'
}
export const addServerData = {
  workOrderTypeCode: 'CloudPmApplication', // 工单类型编号
  resourceCategory: 'Pm',
  preview: {},
  location: {
    name: '',
    businessId: '',
    businessName: '',
    projectId: '',
    projectName: '',
    creatorId: '',
    creatorName: '',
    menderId: '',
    menderName: '',
    ownerId: '',
    ownerName: '',
    tenantId: '',
    remark: ''
  },
  subApplicationParams: [cloneDeep(subServerApplicationParam)],
  emption: {
    duration: {
      mode: 'Hour',
      amount: '1'
    }
  }
}
