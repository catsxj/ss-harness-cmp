<template>
  <component :is="component" title="审批详情">
    <component ref="nodeRef" :is="currentComponent" :item-data="itemData" :disabled="disabled" :ReSubmit="ReSubmit" :Retry="Retry"></component>
    <!-- <basic-table :data="currentNode.params">
      <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="value" label="内容" show-overflow-tooltip>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table> -->
  </component>
</template>

<script lang="ts">
import VmNode from '@/views/resource-apply/ecs/index.vue'
import DiskNode from '@/views/resource-apply/disk/index.vue'
import VpcNode from '@/views/resource-apply/vpc/index.vue'
import LbNode from '@/views/resource-apply/lb/index.vue'
import FipNode from '@/views/resource-apply/fip/index.vue'
import TaskNode from '@/views/resource-apply/task/index.vue'
import SoftwareNode from '@/views/resource-apply/software.vue'
import RedisNode from '@/views/resource-apply/redis.vue'
import MongodbNode from '@/views/resource-apply/mongodb.vue'
import RabbitmqNode from '@/views/resource-apply/rabbitmq.vue'
import PreviewItem from './PreviewItem.vue'
import PreviewItems from './PreviewItems.vue'
import Snapshot from '@/views/resource-apply/snapshot/index.vue'
import UpgradeSpec from './UpgradeSpec.vue'
import AddDisk from './addDisk/index.vue'
import EditDisk from './disk/index.vue'
import ExpansionDisk from './ExpansionDisk.vue'
import VmClone from './VmClone.vue'
import DelayService from './DelayService.vue'
import ServerNode from '@/views/resource-apply/server/index.vue'
import UpgradePublicSpec from './UpgradePublicSpec.vue'
import { defineComponent, ref } from '@vue/composition-api'
import { componentMap } from './config'

function getApplicationComponent(service: string = '', workOrderTypeCode: string) {
  if (service.includes('server') || workOrderTypeCode === 'CloudServerApplication') {
    return 'VmNode'
  }
  if (workOrderTypeCode === 'CloudPmApplication') {
    return 'ServerNode'
  }
  if (service.includes('volume')) {
    return 'DiskNode'
  } else if (service.includes('vpc')) {
    return 'VpcNode'
  }
  if (service.includes('slb')) {
    return 'LbNode'
  }
  if (service.includes('eip')) {
    return 'FipNode'
  }
  if (service.includes('fabric') || service.includes('operations')) {
    return 'TaskNode'
  }
  if (['rds.mysql', 'rds.sqlserver', 'rds.postgresql', 'cms.kafka'].includes(service)) {
    return 'SoftwareNode'
  }
  return componentMap[service]
}
export default defineComponent({
  components: {
    VmNode,
    DiskNode,
    VpcNode,
    LbNode,
    FipNode,
    TaskNode,
    SoftwareNode,
    RedisNode,
    MongodbNode,
    RabbitmqNode,
    PreviewItem,
    UpgradeSpec,
    AddDisk,
    ExpansionDisk,
    VmClone,
    DelayService,
    EditDisk,
    UpgradePublicSpec,
    Snapshot,
    PreviewItems,
    ServerNode
  },
  props: {
    currentNode: {
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    },
    ReSubmit: {
      type: Boolean,
      default: false
    },
    Retry: {
      type: Boolean,
      default: false
    },
    component: {
      default: 'CardLayout'
    }
  },
  setup(props) {
    // 节点数据
    const { ApplyParams, ApplyCategory } = props.currentNode as any
    const itemData = ref(JSON.parse(ApplyParams))
    // 获取变更节点组件
    function getAlterationComponent() {
      let { operation, preview, service } = itemData.value
      if (operation === 'AddDisk') {
        return 'AddDisk'
      }
      if (operation === 'EditDisk') return 'EditDisk'
      if (
        operation === 'Upgrade' &&
        (service === 'tencent.standard.server' || service === 'aliyun.standard.server' || service === 'zstack.standard.server' || service === 'aws.standard.server' || service === 'huawei.standard.server' || service === 'manageone.standard.server' || service === 'qcloud.standard.server')
      ) {
        return 'UpgradePublicSpec'
      }
      // 后端不给力返回数据不一致，做容错处理
      if (typeof preview === 'string') {
        preview = JSON.parse(preview)
      }
      if (preview.operation === 'ExpansionDisk') return 'ExpansionDisk'
      return 'UpgradeSpec'
    }
    // 当前节点
    const currentComponent = ref('')
    const { service, workOrderTypeCode } = itemData.value
    switch (ApplyCategory) {
      case 'ApplicationOperate':
      case 'EFCApplicationOperate':
        currentComponent.value = getApplicationComponent(service, workOrderTypeCode)
        break
      case 'UnsubscribeOperate':
      case 'EFCUnsubscribeOperate':
        currentComponent.value = 'PreviewItem'
        break
      case 'AlterationOperate':
      case 'EFCAlterationOperate':
        currentComponent.value = getAlterationComponent()
        break
      case 'ResourceComputerClone':
        currentComponent.value = 'VmClone'
        break
      case 'ExtensionOperate':
      case 'EFCExtensionOperate':
        currentComponent.value = 'DelayService'
        break
      case 'EFCSnapshotApplicationOperate':
        currentComponent.value = 'Snapshot'
        break
      case 'BacthUnsubscribeOperate':
        currentComponent.value = 'PreviewItems'
        break
    }
    const nodeRef = ref()
    function getPostData() {
      const node = nodeRef.value
      let result = JSON.parse(ApplyParams)
      if (node && node.getApplyData) {
        result = node.getApplyData()
      }
      return result
    }
    return {
      itemData,
      currentComponent,
      nodeRef,
      getPostData
    }
  }
})
</script>
<style></style>
