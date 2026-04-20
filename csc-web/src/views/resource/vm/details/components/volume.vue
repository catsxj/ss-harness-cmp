<template>
  <div>
    <el-card class="m-t" :body-style="{ padding: 0 }">
      <div slot="header" class="clearfix">
        <span>存储配置</span>
        <slot name="operate"></slot>
      </div>
      <basic-table border :data="list" style="margin: 10px">
        <el-table-column prop="name" label="硬盘名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="size" label="容量(GB)" show-overflow-tooltip></el-table-column>
        <el-table-column v-if="['CNWARE', 'USPHERE'].includes(detail.vendorType)" prop="bus" label="总线类型" show-overflow-tooltip>
          <template v-slot="scope">
            {{ busType[scope.row.bus] }}
          </template>
        </el-table-column>
        <el-table-column v-if="['CNWARE'].includes(detail.vendorType)" prop="dataStoreName" label="所属存储池" show-overflow-tooltip></el-table-column>
        <el-table-column v-if="detail.vendorType == 'VMWARE' || detail.vendorType == 'INSPURRAIL'" prop="lvmMntp" label="挂载目录" show-overflow-tooltip></el-table-column>
        <slot name="el-table-column"></slot>
        <div slot="pagination"></div>
      </basic-table>
    </el-card>
  </div>
</template>

<script>
import { conditionVoleme } from 'services/platform/index'
import '../index.scss'

export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {},
  data() {
    return {
      list: [],
      busType: {
        virtio: '高速硬盘',
        ide: 'IDE硬盘',
        scsi: 'SCSI硬盘',
        sata: 'SATA硬盘',
        usb: 'USB硬盘'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(page) {
      conditionVoleme({
        condition: 'listByVmId',
        serverId: this.detail.id
      }).then(data => {
        if (data.success) {
          this.list = data.data
          this.$emit('back', data.data.length)
        }
      })
    }
  }
}
</script>
<style lang="scss"></style>
