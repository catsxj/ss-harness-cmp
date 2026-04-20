<template>
  <div>
    <el-card class="m-t-xs" :body-style="{ padding: 0 }">
      <div slot="header" class="clearfix">
        <span>存储配置</span>
        <slot name="operate"></slot>
      </div>
      <basic-table border :data="list" :params="params" :get-list="getList" :total="total" style="margin: 10px">
        <el-table-column prop="name" label="硬盘名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="size" label="容量(GB)" show-overflow-tooltip></el-table-column>
        <el-table-column prop="device" label="设备路径" show-overflow-tooltip></el-table-column>
        <slot name="el-table-column"></slot>
      </basic-table>
    </el-card>
  </div>
</template>

<script>
import { getVolume } from 'services/platform/smart'
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
  watch: {
    detail() {
      this.getList()
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      params: {
        action: 'attached',
        page: 1,
        rows: 10
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList(page) {
      this.params.page = page || this.params.page
      const params = {
        action: 'attached',
        page: this.params.page,
        rows: this.params.rows
      }
      params.params = JSON.stringify([
        {
          param: { vendorId: this.detail.vendorId },
          sign: 'EQ'
        }
      ])
      getVolume(this.detail.id, params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.$emit('back', data.data.rows.length)
          this.total = data.data.total
          this.list.forEach((data, index) => {
            if (data.status == 'AVAILABLE') {
              data.status1 = '可用'
              data.statusColor = 'primary'
            } else if (data.status == 'IN_USE' || data.status == 'IN-USE') {
              data.status1 = '正在使用'
              data.statusColor = 'success'
            } else if (data.status == 'BUILDING') {
              data.status1 = '创建中'
              data.statusColor = 'warning'
            } else if (data.status == 'DELETING') {
              data.status1 = '删除中'
              data.statusColor = 'warning'
            } else {
              data.status1 = '异常'
              data.statusColor = 'danger'
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss"></style>
