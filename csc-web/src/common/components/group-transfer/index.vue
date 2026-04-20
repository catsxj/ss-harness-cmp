<template>
  <el-row :gutter="10">
    <el-col :span="12">
      <el-card>
        <div slot="header">
          <span>{{ titles[0] }}</span>
          <el-button type="primary" class="pull-right" style="margin-top: 5px" size="mini" @click="addItems"
            >移入
            <i class="el-icon-right"></i>
          </el-button>
        </div>
        <div style="height: 360px; overflow-y: auto">
          <el-row v-for="(item, key) in source" :key="key">
            <el-col :span="24" class="cell-title">{{ prefix }}{{ key }}</el-col>
            <el-col class="cell" :span="24" v-for="(cell, key) in item" :key="key">
              <el-checkbox v-model="cell.checked">{{ cell[label] }}</el-checkbox>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <div slot="header">
          <span class="pull-right">{{ titles[1] }}</span>
          <el-button type="danger" size="mini" @click="removeItems">
            <i class="el-icon-back"></i>
            移除
          </el-button>
        </div>
        <div style="height: 360px; overflow-y: auto">
          <el-row v-for="(item, key) in target" :key="key">
            <el-col :span="24" class="cell-title">{{ prefix }}{{ key }}</el-col>
            <el-col class="cell" :span="24" v-for="(cell, key) in item" :key="`${key}${item.name}`">
              <el-checkbox v-model="cell.checked">{{ cell[label] }}</el-checkbox>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  model: {
    prop: 'checkedIds',
    event: 'change'
  },
  props: {
    titles: {
      type: Array,
      default: function () {
        return ['列表1', '列表2']
      }
    },
    label: {
      type: String,
      default: 'name'
    },
    value: {
      type: String,
      default: 'id'
    },
    data: {
      type: Array,
      required: true
    },
    groupKey: {
      type: String,
      default: 'group'
    },
    prefix: {
      type: String,
      default: ''
    },
    checkedIds: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      selectList: [],
      sourceList: []
    }
  },
  created() {
    this.init()
  },
  watch: {
    data: {
      handler(newVal, oldVal) {
        this.selectList = []
        this.sourceList = []
        this.init()
      }
    }
  },
  computed: {
    source() {
      return this.formatData(this.sourceList)
    },
    target() {
      return this.formatData(this.selectList)
    }
  },
  methods: {
    init() {
      ;[...this.data].forEach((item, key) => {
        const result = {
          ...item,
          checked: false,
          orderKey: key
        }
        if (this.checkedIds.includes(item[this.value])) {
          this.selectList.push(result)
        } else {
          this.sourceList.push(result)
        }
      })
    },
    formatData(data) {
      const source = {}
      data.forEach(item => {
        const key = item[this.groupKey]
        if (source[key]) {
          source[key].push(item)
        } else {
          source[key] = [item]
        }
      })
      return source
    },
    addItems() {
      const list = []
      this.sourceList.forEach(item => {
        if (item.checked) {
          this.selectList.push({
            ...item,
            checked: false
          })
        } else {
          list.push(item)
        }
      })
      this.sourceList = [...list].sort((a, b) => {
        return a.orderKey - b.orderKey
      })
      this.getChekckIds()
    },
    removeItems() {
      const list = []
      this.selectList.forEach(item => {
        if (item.checked) {
          this.sourceList.push({
            ...item,
            checked: false
          })
        } else {
          list.push(item)
        }
      })
      this.selectList = [...list]
      this.getChekckIds()
    },
    getChekckIds() {
      const checkedIds = this.selectList.map(item => item[this.value])
      this.$emit('change', checkedIds)
    }
  }
}
</script>

<style scoped>
.cell-title {
  font-size: 12px;
  font-weight: bold;
}
.cell {
  padding: 5px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
