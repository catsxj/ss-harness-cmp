<template>
  <div style="padding-bottom: 30px">
    <basic-table :data="list" :other-props="{ spanMethod }">
      <el-table-column prop="catalogName" label="服务目录"> </el-table-column>
      <el-table-column prop="serviceName" label="服务"> </el-table-column>
      <el-table-column prop="quotaName" label="资源">
        <template v-slot="scope">
          <div>{{ scope.row.quotaName }}（{{ scope.row.unit || '个' }}）</div>
        </template>
      </el-table-column>
      <el-table-column prop="used" label="已使用用配额"> </el-table-column>
      <el-table-column prop="free" label="未分配配额"> </el-table-column>
      <el-table-column prop="projectAssigned" label="应用系统分配配额"> </el-table-column>
      <el-table-column prop="projectFree" label="应用系统剩余配额"> </el-table-column>
      <el-table-column prop="assigned" label="租户分配配额"> </el-table-column>
      <el-table-column prop="quota" label="总配额"> </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </div>
</template>
<script>
import { getServiceQuota } from 'services/system'

export default {
  data() {
    return {
      list: [],
      rowSpan: {}
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      getServiceQuota(this.userData.id, { target: this.userData.id, condition: 'getQuotaDetail' }).then(data => {
        if (data.success) {
          this.handleData(data.data)
        }
      })
    },
    // 将数据整合列表数据并且根据坐标生成合并数
    handleData(data) {
      const list = []
      const rowSpan = {}
      let columnCount = 0
      // key值对columnCount进行缓存，因为columnCount每次循环都是变化的
      let key = 0
      data.forEach((item, itemIndex) => {
        let count = 0
        item.quota.forEach((cell, cellIndex) => {
          const length = 1 // cell.quotaDetail.length
          // 第二列合并数
          rowSpan[`${columnCount}-1`] = length
          columnCount += length
          count += length
          const result = {
            catalogName: item.catalogName,
            serviceName: cell.serviceName,
            ...cell.quotaDetail
          }
          list.push(result)
          // cell.quotaDetail.forEach(unit => {
          //   const result = {
          //     catalogName: item.catalogName,
          //     serviceName: cell.serviceName,
          //     ...unit
          //   }
          //   list.push(result)
          // })
        })
        // 第一列合并数
        rowSpan[`${key}-0`] = count
        key = columnCount
      })
      this.list = list
      this.rowSpan = rowSpan
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      // 第一列和第二列合并时进行合并，不合并时不显示
      if (columnIndex === 0 || columnIndex === 1) {
        const rowspan = this.rowSpan[`${rowIndex}-${columnIndex}`]
        return rowspan ? [rowspan, 1] : [0, 0]
      }
      // 默认不合并
      return [1, 1]
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-table__body tr:hover > td {
    background-color: transparent !important;
  }
}
</style>
