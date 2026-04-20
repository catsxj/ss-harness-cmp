<template>
  <el-dialog title="资源详情" :visible.sync="dialogData.visible" width="90%" append-to-body top="5vh" v-loading="loading">
    <Detail :data="installDetail" v-if="detailFlag" @goBack="dialogData.visible = false" @back="dialogData.visible = false"></Detail>
  </el-dialog>
</template>

<script>
import { getVm, detailVm } from 'services/platform/index'
import Detail from '@/views/resource/vm/detail/index.vue'
export default {
  components: { Detail },
  props: {
    dialogData: {
      type: Object,
      default: () => ({ visible: false })
    }
  },
  data() {
    return {
      installDetail: {},
      detailFlag: false,
      loading: false
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    // 跳转详情页
    async getDetail() {
      this.loading = true
      const res = await getVm({
        page: 1,
        rows: 10,
        params: this.$tools.handleSearchParam({
          uuid: this.dialogData.record.sn
        })
      })
      if (!res.success) return
      const row = res.data.rows?.[0]
      if (!row) {
        this.loading = false
        this.dialogData.visible = false
        return this.$message.error('未查询到数据')
      }
      const data = await detailVm(row.id).finally(() => (this.loading = false))
      if (!data.success) return
      if (row.vendorType === 'SANGFOR') {
        data.data = {
          ...data.data,
          detail: JSON.parse(data.data.detail || '{}'),
          sangforNetworks: JSON.parse(data.data.sangforNetworks || '[]').map(item => {
            // 将下划线命名转为驼峰命名
            const newItem = {}
            Object.keys(item).forEach(key => {
              const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
              newItem[newKey] = item[key]
            })
            return newItem
          })
        }
        if (data.data.privateIps) {
          data.data.privateIps = JSON.stringify(Object.values(JSON.parse(data.data.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
        }
      }
      this.installDetail = data.data
      this.installDetail.configuration = this.installDetail.cpu + 'C/' + this.installDetail.memory + 'GB/' + this.installDetail.disk + 'GB'
      this.installDetail.osConfig = this.installDetail.osName ? this.installDetail.osName : '' + ' ' + this.installDetail.osVersion ? this.installDetail.osVersion : ''
      this.installDetail.privateIpsList = data.data.privateIps ? JSON.parse(data.data.privateIps) : []
      this.installDetail.publicIpsList = data.data.publicIps ? JSON.parse(data.data.publicIps) : []
      this.judgeOperate(this.installDetail)
      this.installDetail.expiredTime = row.expiredTime
      this.installDetail.showBtn = false
      this.detailFlag = true
    },

    judgeOperate(data) {
      // 组合云主机配置
      data.hostConfig = data.cpu + 'C/' + data.memory + 'GB/' + (data.disk ? data.disk : 0) + 'GB'
      // if (data.vendorType != 'VMWARE') data.disSnap = true;
      switch (data.status) {
        case 'STOPPING':
          data.allDisabled = true
          break
        case 'STARTING':
          data.allDisabled = true
          break
        case 'SUSPENDING':
          data.allDisabled = true
          break
        case 'RESTARTING':
          data.allDisabled = true
          break
        case 'PAUSED':
          data.disControl = true
          data.disMonitor = true
          data.disStart = true
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disSuspended = true
          data.disRecover = true
          data.disActive = false
          data.disPostpone = false
          data.disSnapshot = false
          data.disPassword = true
          break
        case 'ACTIVING':
          data.allDisabled = true
          break
        case 'INACCESSIBLE':
          data.disControl = true
          data.disStart = true
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disActive = true
          data.disSuspended = true
          data.isExpired = true
          data.disPassword = true
          data.isSHELVED = true
          data.disPostpone = true
          break
        case 'SYNSEXCEPTION':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'BUILDING':
          data.allDisabled = true
          break
        case 'EXCEPTION':
          data.disControl = true
          data.disMonitor = true
          data.disStart = true
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disActive = true
          data.disSuspended = true
          data.disRecover = true
          data.disPostpone = true
          data.disPassword = true
          data.disSnapshot = true
          data.isSHELVED = true
          break
        case 'RUNNING':
          data.disControl = false
          data.disMonitor = false
          data.disStart = true
          data.disStop = false
          data.disRestart = false
          data.disShutoff = false
          data.disActive = true
          data.disSuspended = false
          data.disRecover = true
          data.disPostpone = false
          data.disPassword = false
          data.disSnapshot = false
          break
        case 'STOPPED':
          data.disControl = true
          data.disMonitor = true
          data.disStart = false
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disSuspended = true
          data.disRecover = true
          data.disActive = true
          data.disPostpone = false
          data.disSnapshot = false
          data.disPassword = true
          break
        case 'SUSPENDED':
          data.disControl = true
          data.disMonitor = true
          data.disStart = false
          data.disStop = false
          data.disRestart = true
          data.disShutoff = true
          data.disSuspended = true
          data.disRecover = false
          data.disActive = true
          data.disPostpone = false
          data.disSnapshot = false
          data.disPassword = true
          break
        case 'UNKNOWN':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'UNKNOWNON':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'UNKNOWNOFF':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'UNKNOWNSUSPEND':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'RECOVERING':
          data.allDisabled = true
          break
        case 'PAUSING':
          data.allDisabled = true
          break
        case 'SHELVED':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'RESTORING':
          data.allDisabled = true
          break
      }
    }
  }
}
</script>
