/** * Created by Zhang Haijun on 2017/12/11. */
<template>
  <el-form class="cmdb-form">
    <div v-for="row in detailData" :key="row.id">
      <CardLayout :title="row.name" v-if="row.type === 'GROUP'">
        <item-detail v-for="item in row.subItem" :key="item.id" :item="item"></item-detail>
      </CardLayout>
      <item-detail :item="row" v-else></item-detail>
    </div>
  </el-form>
</template>
<script>
import itemDetail from './moduleItemDetail.vue'
import { getProperties } from 'services/cmdb/module'
import { getInstance, getInstanceDetail } from 'services/cmdb/instance'

export default {
  components: {
    itemDetail
  },
  props: {
    id: {
      type: Number
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      data: '',
      showType: 'password', // 加密数据默认password
      detailData: {}
    }
  },
  watch: {
    id() {
      this.getDetail()
    }
  },
  created() {
    this.getDetail()
  },
  mounted() {},
  methods: {
    handleData(record) {
      const self = this
      const getQuoteData = function (row) {
        // 引用类型处理
        getInstance({
          simple: true,
          showTitle: true,
          params: JSON.stringify([{ param: { moduleId: row.linkModuleId }, sign: 'EQ' }])
        }).then(data => {
          if (data.success) {
            self.$set(row, 'quoteData', data.data.rows)
          }
        })
      }
      const data = [],
        groupMap = {}
      record.groups.forEach(item => {
        const { id, name, orderNum } = item
        const obj = {
          type: 'GROUP',
          id,
          name,
          orderNum,
          subItem: []
        }
        groupMap[item.name] = obj
        data.push(obj)
      })
      record.properties.forEach(item => {
        if (item.type === 'QUOTE') getQuoteData(item)
        else if (item.type === 'CHECKBOX') {
          item.defaultValue = item.defaultValue ? item.defaultValue.split(',') : []
        } else if (item.type === 'TABLE') {
          item.grid = item.grid || []
        }
        if (item.groupName) groupMap[item.groupName].subItem.push(item)
        else data.push(item)
      })
      // 对data排序
      const finalData = []
      data.forEach(item => {
        finalData[item.orderNum] = item
      })
      this.detailData = finalData.filter(item => item)
    },
    getDetail() {
      const http = this.type === 'EDIT' ? getInstanceDetail : getProperties
      http(this.id).then(data => {
        if (data.success) {
          if (this.type === 'EDIT') {
            data.data.properties.forEach(item => {
              item.defaultValue = item.propertyValue
            })
          }
          this.handleData(data.data)
        }
      })
    },
    saveInstance() {
      const handleItem = function (item) {
        const obj = {
          propertyId: item.id,
          propertyCode: item.code,
          propertyValue: item.defaultValue,
          grid: item.grid
        }
        if (item.type == 'CHECKBOX') {
          obj.propertyValue = item.defaultValue.join(',')
        }

        properties.push(obj)
      }
      const properties = []
      this.detailData.forEach(row => {
        if (row.type == 'GROUP') {
          row.subItem.forEach(item => {
            handleItem(item)
          })
        } else {
          handleItem(row)
        }
      })
      return properties
    },
    validateInteger(item) {
      if (!item.defaultValue) return
      item.defaultValue = Math.round(item.defaultValue)
      if (item.maxValue && item.defaultValue > item.maxValue) item.defaultValue = item.maxValue
      if (item.minValue && item.defaultValue < item.minValue) item.defaultValue = item.minValue
    }
  }
}
</script>
<style scoped>
.w-full .el-input-number .el-input__inner {
  text-align: left;
}
</style>
