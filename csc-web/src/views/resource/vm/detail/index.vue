<template>
  <div>
    <op v-if="data.vendorType === 'OPENSTACK'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></op>
    <easy-stack v-else-if="data.vendorType === 'EASYSTACK'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></easy-stack>
    <vc v-else-if="data.vendorType === 'VMWARE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></vc>
    <h3c v-else-if="data.vendorType === 'H3C'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></h3c>
    <INSPURRAIL v-else-if="data.vendorType === 'INSPURRAIL'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></INSPURRAIL>
    <aliyun v-else-if="data.vendorType === 'ALIYUN'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></aliyun>
    <cecstack v-else-if="data.vendorType === 'CECSTACK'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></cecstack>
    <jdyun v-else-if="data.vendorType === 'JDCLOUD'" :data="data" @goBack="goBack"></jdyun>
    <tencent v-else-if="data.vendorType === 'TENCENT'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></tencent>
    <huawei v-else-if="data.vendorType === 'HUAWEI'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></huawei>
    <qcloud v-else-if="data.vendorType === 'QCLOUD'" :detail="data" @goBack="goBack"></qcloud>
    <aws v-else-if="data.vendorType === 'AWS'" :detail="data" @goBack="goBack" @back="$emit('back', data)"></aws>
    <mo v-else-if="data.vendorType === 'MANAGEONE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></mo>
    <tce v-else-if="data.vendorType === 'TCE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></tce>
    <azure v-else-if="data.vendorType === 'AZURE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></azure>
    <smart v-else-if="data.vendorType === 'SMARTX'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></smart>
    <cloudTower v-else-if="data.vendorType === 'CLOUDTOWER'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></cloudTower>
    <zstack v-else-if="data.vendorType === 'ZSTACK'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></zstack>
    <fusion-sphere v-if="data.vendorType === 'FUSIONSPHERE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></fusion-sphere>
    <sangfor v-if="data.vendorType === 'SANGFOR'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></sangfor>
    <cnware v-else-if="data.vendorType === 'CNWARE'" :detail="data" @back="$emit('back', data)" @goBack="goBack"></cnware>
  </div>
</template>

<script>
import op from '../details/op/index.vue'
import easyStack from '../details/easyStack/index.vue'
import vc from '../details/vmware/index.vue'
import h3c from '../details/h3c/index.vue'
import INSPURRAIL from '../details/INSPURRAIL/index.vue'
import aliyun from '../details/ali/index.vue'
import cecstack from '../details/cecstack/index.vue'
import jdyun from './jdyun.vue'
import tencent from '../details/tencent/index.vue'
import huawei from '../details/huawei/index.vue'
import qcloud from '../details/qcloud/index.vue'
import azure from '../details/azure/index.vue'
import aws from '../details/aws/index.vue'
import mo from '../details/manageone/index.vue'
import tce from '../details/tce/index.vue'
import smart from '../details/smart/index.vue'
import fusionSphere from '../details/fusionsphere/index.vue'
import cloudTower from '../details/cloudTower/index.vue'
import sangfor from '../details/sf/index.vue'
import cnware from '../details/cnware/index'
import zstack from '../details/zstack/index.vue'
export default {
  props: {
    data: {
      type: Object
    },
    vendorId: {
      type: [String, Number]
    }
  },
  components: {
    op,
    vc,
    aliyun,
    jdyun,
    tencent,
    huawei,
    qcloud,
    azure,
    aws,
    mo,
    tce,
    smart,
    fusionSphere,
    easyStack,
    sangfor,
    cloudTower,
    zstack,
    cnware,
    cecstack,
    INSPURRAIL,
    h3c
  },
  methods: {
    goBack() {
      this.$emit('goBack')
    },
    conductStatus(data) {
      // 按钮控制
      switch (data.status) {
        case 'RUNNING':
          data.isShowStop = true
          data.isShowRestart = true
          data.isShowPaused = true
          data.isShowSuspended = true
          data.isOffline = false
          data.statusColor = 'success'
          break
        case 'STOPPED':
          data.isModifyConfig = false
          data.isFlotip = false
          data.isMount = false
          data.isUnload = false
          data.isShowStop = false
          data.isShowRestart = true
          data.isRestart = true
          data.isStop = true
          data.isShowStart = true
          data.isStart = false
          data.isControl = true
          data.isShowRecover = true
          data.isRecover = false
          data.isStopDormant = false
          data.isShowActive = true
          data.isMonitor = true
          data.isSnapshot = false
          data.isActive = false
          data.statusColor = 'warning'
          data.isOffline = false
          data.isException1 = true
          data.isException = true
          data.isBackup = false
          break
        case 'STOPPING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'STARTING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'SUSPENDED':
          data.isFlotip = false
          data.isModifyConfig = true
          data.isShowStop = false
          data.isShowRestart = true
          data.isStopDormant = false
          data.isShowStart = false
          data.isShowActive = true
          data.isRemove = true
          data.isControl = true
          data.isRestart = true
          data.isResume = true
          data.isActive = false
          data.isException = true
          data.isException1 = true
          data.isSnapshot = false
          data.isBackup = true
          data.statusColor = 'primary'
          break
        case 'SUSPENDING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'ACTIVING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'PAUSED':
          data.isFlotip = true
          data.isModifyConfig = true
          data.isControl = true
          data.isShowStop = false
          data.isShowRestart = true
          data.isRestart = true
          data.isRemove = true
          data.isShowStart = false
          data.isShowRecover = true
          data.isStopDormant = true
          data.isMonitor = true
          data.isSnapshot = false
          data.isRecover = false
          data.isException = true
          data.isBackup = true
          data.statusColor = 'warning'
          break
        case 'PAUSING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'RECOVERING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'BUILDING':
          data.isAlldisabled = true
          data.isRemove = false
          data.statusColor = 'default'
          break
        case 'RESTARTING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'default'
          break
        case 'EXPIRED':
          data.isShowStop = false
          data.isShowRestart = true
          data.isStopDormant = false
          data.isRestart = true
          data.isShowStart = true
          data.isStart = true
          data.isShowRecover = true
          data.isRecover = true
          data.isShowActive = true
          data.isActive = true
          data.isException = true
          data.isSnapshot = true
          data.isBackup = true
          data.isAuth = true
          data.statusColor = 'default'
          break
        case 'EXCEPTION':
          data.isAlldisabled = true
          data.isRemove = false
          data.isAuth = true
          data.statusColor = 'danger'
          break
        case 'SYNSEXCEPTION':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'danger'
          break
        case 'RESIZING':
          data.affirmModify = true
          data.isControl = true
          data.isMonitor = true
          data.isSnapshot = true
          data.isException1 = true
          data.isException = true
          data.isBackup = true
          data.isRemove = true
          data.statusColor = 'warning'
          break
        case 'SHELVED':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'danger'
          break
        case 'RESTORING':
          data.isAlldisabled = true
          data.isRemove = true
          data.statusColor = 'warning'
          break
      }
    }
  },
  watch: {
    data() {
      this.conductStatus(this.data)
    }
  },
  created() {
    this.conductStatus(this.data)
  }
}
</script>

<style scoped></style>
