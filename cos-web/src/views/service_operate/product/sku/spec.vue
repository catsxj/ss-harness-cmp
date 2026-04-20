<template>
  <basic-form :model="specData" ref="specForm">
    <el-row :gutter="10">
      <el-col :span="24" v-if="isCheckbox">
        <basic-form-item label="配置：">
          <el-checkbox v-for="(item, key) in specData.data" :key="key" v-model="item.specValue">{{ item.specName }}</el-checkbox>
        </basic-form-item>
      </el-col>
      <template v-else>
        <el-col :span="12" v-for="(item, key) in specData.data" :key="key">
          <basic-form-item v-if="!item.hidden" :label="`${item.displayName}：`" :prop="`data.${key}.specValue`" :validate="item.validate">
            <el-input :type="item.type" v-model="item.specValue" :disabled="item.disabled || addData.reserved">
              <template slot="append" v-if="item.unit">{{ item.unit }}</template>
            </el-input>
          </basic-form-item>
        </el-col>
      </template>
    </el-row>
  </basic-form>
</template>
<script>
import getConfig from './config/index'
export default {
  props: {
    addData: {
      type: Object
    },
    code: {
      type: String
    }
  },
  data() {
    return {
      specData: {},
      isCheckbox: false
    }
  },
  created() {
    if (this.addData.id) this.init()
  },
  watch: {
    code: {
      handler: function () {
        this.setConfig()
        this.isCheckbox = ['VP', 'WEB', 'INT', 'FORTMACHINE'].includes(this.code)
      },
      immediate: true
    }
  },
  methods: {
    setConfig() {
      if (!this.code) return
      this.$set(this.specData, 'data', getConfig(this.code))
    },
    init() {
      const specData = JSON.parse(this.addData.spec)
      this.specData.data.forEach((item, index) => {
        item.specValue = specData[index].specValue
      })
    },
    getSkuData() {
      let data = false
      this.$refs.specForm.validate((valid) => {
        if (valid) {
          data = []
          if (this.specData.data) {
            this.specData.data.forEach((item) => {
              const { specName, specValue, unit } = item
              data.push({ specName, specValue, unit })
            })
          }
        }
      })
      return data
    }
  }
}
</script>
