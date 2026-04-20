<template>
  <basic-form ref="form" :model="itemData" :disabled="isPreview">
    <el-row :gutter="10">
      <el-col :span="24">
        <div class="search-container">
          <div class="legend">基本配置</div>
          <div class="search-content">
            <el-form-item label="请求路径：" required>
              <el-input v-model="itemData.url"></el-input>
            </el-form-item>
            <basic-form-item label="请求方法：" validate="required" prop="method">
              <el-radio-group v-model="itemData.method">
                <el-radio-button v-for="item in httpMethod" :label="item" :key="item"></el-radio-button>
              </el-radio-group>
            </basic-form-item>
            <basic-form-item label="FORMAT：" validate="required" prop="format">
              <el-radio-group v-model="itemData.format">
                <el-radio v-for="item in httpFormat" :label="item" :key="item"></el-radio>
              </el-radio-group>
            </basic-form-item>
          </div>
        </div>
        <el-form ref="validateForm" :model="data" label-width="100px" :disabled="isPreview">
          <div class="search-container">
            <div class="legend">请求头部：</div>
            <div class="search-content">
              <el-row :gutter="10" v-for="(item, key) in data.headerData" :key="key">
                <el-col :span="10">
                  <basic-form-item label="KEY:" validate="required" required-message="请输入KEY值" :prop="'headerData.' + key + '.key'">
                    <el-input v-model="item.key"></el-input>
                  </basic-form-item>
                </el-col>
                <el-col :span="10">
                  <basic-form-item label="VALUE:" validate="required" required-message="请输入VALUE值" :prop="'headerData.' + key + '.value'" maxlength="4096">
                    <el-input v-model="item.value"></el-input>
                  </basic-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button type="danger" icon="el-icon-delete" @click="removeItem(key, data.headerData)" v-if="!isPreview"></el-button>
                </el-col>
              </el-row>
              <el-button v-if="!isPreview" type="primary" @click="addItem(data.headerData)">
                <i class="el-icon-plus"></i>
                新增请求头部
              </el-button>
            </div>
          </div>
          <div class="search-container">
            <div class="legend">请求参数</div>
            <div class="search-content" v-if="itemData.format === 'RAW'">
              <el-input type="textarea" v-model="itemData.body"></el-input>
            </div>
            <div class="search-content" v-else>
              <el-row :gutter="10" v-for="(item, key) in data.paramsData" :key="key">
                <el-col :span="10">
                  <basic-form-item label="KEY:" validate="required" required-message="请输入KEY值" :prop="'paramsData.' + key + '.key'">
                    <el-input v-model="item.key"></el-input>
                  </basic-form-item>
                </el-col>
                <el-col :span="10">
                  <basic-form-item label="VALUE:" validate="required" required-message="请输入VALUE值" :prop="'paramsData.' + key + '.value'" maxlength="4096">
                    <el-input v-model="item.value"></el-input>
                  </basic-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button type="danger" icon="el-icon-delete" @click="removeItem(key, data.paramsData)" v-if="!isPreview"></el-button>
                </el-col>
              </el-row>
              <el-button v-if="!isPreview" type="primary" @click="addItem(data.paramsData)">
                <i class="el-icon-plus"></i>
                新增请求参数
              </el-button>
            </div>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import show from '../../mixins/show'
import { httpMethod, httpFormat } from '@/common/commonData'

export default {
  mixins: [show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          method: 'POST',
          format: 'FORM_DATA',
          url: ''
        }
      }
    }
  },
  data() {
    return {
      httpMethod,
      httpFormat,
      data: {
        headerData: [],
        paramsData: []
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    // 编辑数据回现
    initData() {
      Object.keys(this.itemData.params || {}).forEach(key => {
        this.data.paramsData.push({ key: key, value: this.itemData.params[key] })
      })
      Object.keys(this.itemData.headers || {}).forEach(key => {
        this.data.headerData.push({ key: key, value: this.itemData.headers[key] })
      })
    },
    addItem(data) {
      data.push({})
    },
    removeItem(key, data) {
      data.splice(key, 1)
    },
    formatData() {
      let flag = false
      this.$refs.validateForm.validate(valid => {
        if (valid) {
          const params = {}
          this.data.paramsData.forEach(item => {
            params[item.key] = item.value
          })
          const header = {}
          this.data.headerData.forEach(function (item) {
            header[item.key] = item.value
          })
          this.itemData.params = params
          this.itemData.headers = header
          flag = true
        }
      })
      return flag
    },
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid && this.formatData()) {
          data = this.itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
