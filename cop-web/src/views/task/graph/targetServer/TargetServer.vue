<template>
  <basic-form ref="form" :model="itemData" :disabled="disabled" v-bind="$attrs">
    <el-row :gutter="10" v-if="!hideAuthWay">
      <el-col :span="12">
        <basic-form-item label="认证方式：" validate="required" required-message="请选择认证方式" prop="authenMode">
          <el-select v-model="itemData.authenMode" placeholder="认证方式" @change="selectMode(itemData)">
            <el-option v-for="(value, key) in authenModeOptions" :key="key" :label="value" :value="key"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12" v-if="itemData.authenMode === 'BATCH'">
        <basic-form-item label="执行账户:" prop="identId" validate="required">
          <el-select v-model="itemData.identId" placeholder="请选择执行账户">
            <el-option v-for="item in accountOptions" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12" v-if="showSudo">
        <basic-form-item label="是否sudo：">
          <el-switch v-model="itemData.sudo" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </basic-form-item>
      </el-col>
    </el-row>
    <select-server :item-data="itemData" :os-category="osCategory" :disabled="disabled" ref="serverRef" v-bind="$attrs" v-on="$listeners"></select-server>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import { authenModeOptions } from '@/common/commonData'
import SelectServer from './SelectServer.vue'
import { getIdentsBySimple } from 'services/task/ident.ts'

export default {
  components: {
    SelectServer
  },
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          authenMode: 'SINGLE',
          sudo: true,
          identId: '',
          data: []
        }
      }
    },
    disabled: {
      // 禁止编辑
      type: Boolean,
      default: false
    },
    hideAuthWay: {
      // 否显示认证方式
      type: Boolean,
      default: false
    },
    hideSudo: {
      // 是否隐藏sudo
      type: Boolean,
      default: false
    },
    osCategory: {
      // 系统类别
      type: String,
      default: ''
    }
  },
  data() {
    return {
      authenModeOptions,
      accountOptions: [],
      hideSuspend: false
    }
  },
  computed: {
    showSudo() {
      return !this.hideSudo && this.osCategory !== 'Windows'
    }
  },
  created() {
    this.getAccountList()
  },
  methods: {
    async getAccountList() {
      const data = await getIdentsBySimple()
      if (data.success) {
        this.accountOptions = data.data.rows.map((data) => {
          const { username: name, remark, id } = data
          return {
            id,
            name: remark ? `${name}(${remark})` : name
          }
        })
      }
    },
    setMode(mode) {
      this.itemData.authenMode = mode
      this.selectMode()
    },
    selectMode() {
      if (this.itemData.authenMode !== 'BATCH') {
        this.itemData.identId = ''
      }
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        const hosts = this.$refs.serverRef.getPostData()
        if (valid && hosts) {
          data = cloneDeep(this.itemData)
          data.data = hosts
        }
      })
      return data
    }
  }
}
</script>
