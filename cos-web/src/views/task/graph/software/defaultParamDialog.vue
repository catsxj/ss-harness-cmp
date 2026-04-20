<template>
  <el-dialog title="默认参数配置" :close-on-click-modal="false" :visible.sync="dialog.visible" append-to-body>
    <el-form class="cmdb-form">
      <el-row>
        <template v-for="row in detailData">
          <el-col :span="12" :key="row.id" class="item" v-if="isShowItem(row)">
            <CardLayout :title="row.name" v-if="row.type === 'GROUP'">
              <div v-for="item in row.subItem" :key="item.id">
                <item-detail :item="item" v-if="isShowItem(item)"></item-detail>
              </div>
            </CardLayout>
            <item-detail label-width="150px" :item="row" :disabled="isPreview"></item-detail>
          </el-col>
        </template>
      </el-row>
      <el-row v-for="item in tableData" :key="item.id">
        <el-col :span="24">
          <item-detail label-width="150px" :item="item" :disabled="isPreview"></item-detail>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="!isPreview">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="save(false)">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import show from '../mixins/show'
import itemDetail from './moduleItemDetail.vue'
import { getPropertiesByCode } from 'services/cmdb/module'
import { encrypt, decrypt } from 'utils/crypto'

export default {
  mixins: [show],
  components: {
    itemDetail
  },
  props: {
    itemData: {
      type: Object
    },
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      detailData: [],
      tableData: [],
      cacheConfigs: {}
    }
  },
  watch: {
    'dialog.visible'() {
      if (this.dialog.visible) {
        this.getDetail()
      }
    }
  },
  created() {
    this.getDetail()
    this.cacheConfigs = Object.assign({}, this.itemData)
  },
  mounted() {},
  methods: {
    isShowItem(item) {
      return item.code !== 'bname' && item.code !== 'name'
    },
    handleData(record) {
      this.groupCount = 0
      this.activeNames = []
      this.tableData = []
      const data = [],
        groupMap = {}
      record.groups.forEach((item, key) => {
        const obj = {
          type: 'GROUP',
          id: item.id,
          name: item.name,
          subItem: []
        }
        this.activeNames.push(item.name)
        this.groupCount++ // 统计是否存在分组 有分组时显示折叠板
        groupMap[item.name] = key
        data.push(obj)
      })
      record.properties.forEach((item) => {
        let value = this.cacheConfigs[item.code]
        // 解密
        if (item.type === 'TEXTENCRYPT' && value && value != item.defaultValue) {
          value = decrypt(value) || value
        }
        item.defaultValue = value === undefined ? item.defaultValue : value
        if (item.code === 'redis_save') {
          item.grid = []
          let itemValue = item.defaultValue
          if (typeof item.defaultValue === 'string') itemValue = JSON.parse(item.defaultValue)
          itemValue.forEach((cell) => {
            const value = cell.split(' ')
            item.grid.push({
              desc1: value[0],
              desc2: value[1]
            })
          })
          this.tableData.push(item)
          return
        }
        if (item.groupName) {
          data[groupMap[item.groupName]].subItem.push(item)
        } else {
          data.push(item)
        }
      })
      this.detailData = data
    },
    getDetail() {
      getPropertiesByCode(this.dialog.code).then((data) => {
        if (data.success) {
          this.handleData(data.data)
        }
      })
    },
    save(isEncrypt = true) {
      const self = this
      const handleItem = (item) => {
        // 默认属性不做处理
        if (!this.isShowItem(item)) return true
        if (item.code === 'redis_save') {
          const value = []
          item.grid.forEach((item) => {
            value.push(`${item.desc1} ${item.desc2}`)
          })
          item.defaultValue = value
        }
        const { expression, message = '请输入正确的格式', defaultValue, name } = item
        if (expression && !new RegExp(expression).test(defaultValue)) {
          this.$message.error(`属性【${name}】校验未通过，${message}`)
          return false
        }
        if (item.type === 'INTEGER') item.defaultValue = Number(item.defaultValue)
        // 数据加密
        else if (item.type === 'TEXTENCRYPT' && isEncrypt) item.defaultValue = encrypt(item.defaultValue)
        value[item.code] = item.defaultValue
        return true
      }
      const value = {}
      let validateResult = true
      const data = [...this.detailData, ...this.tableData]
      for (const row of data) {
        if (row.type === 'GROUP') {
          row.subItem.forEach((item) => {
            handleItem(item)
          })
        } else {
          const flag = handleItem(row)
          if (!flag) {
            validateResult = false
            break
          }
        }
      }
      if (validateResult) {
        this.dialog.visible = false
        this.cacheConfigs = value
        return value
      }
    }
  }
}
</script>
<style scoped lang="scss">
.item {
  height: 51px;
  & >>> .el-select {
    width: 100%;
  }
}
</style>
