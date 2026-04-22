<template>
  <div>
    <basic-form :ref="`${typeName}_form`" labelWidth="120px" :model="itemData" :disabled="disable">
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="认证方式：" validate="required" required-message="请选择认证方式" prop="authenMode">
            <el-select v-model="itemData.authenMode" placeholder="认证方式" @change="selectMode(itemData)">
              <el-option v-for="(value, key) in authenModeOptionsList" :key="key" :label="value" :value="key">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="itemData.authenMode === 'BATCH'">
          <basic-form-item label="执行账户:"  prop="identId" validate="required">
            <el-select v-model="itemData.identId" placeholder="请选择执行账户">
              <el-option v-for="item in accountOptions" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="executeType == 'remote'">
          <basic-form-item label="是否sudo：">
            <el-switch v-model="itemData.sudo" active-color="#13ce66"
                        inactive-color="#ff4949"></el-switch>
          </basic-form-item>
        </el-col>
      </el-row>
      <select-server :itemData="itemData"></select-server>
    </basic-form>
  </div>
</template>
<script>
import { encrypt } from 'utils/crypto'
import { cloneDeep } from 'lodash-es'
import { authenModeOptions } from '@/common/commonData.js'
import SelectServer from 'views/bsm-cache/cmdbServer/middleServer2.vue'
import { getIdent } from 'services/task/inspect'
export default {
  components: {
    SelectServer
  },
  props: {
    isview: {
      type: Boolean,
      default: false
    },
    itemData: {
      type: Object,
      default: function () {
        return {
          authenMode: 'SINGLE',
          sudo: true,
          identId: '',
          hostList: []
        }
      }
    },
    showTabList: {
      type: Array
    },
    disable: {
      type: Boolean,
      default: false
    },
    executeType: {
      type: String
    }
  },
  data () {
    return {
      typeName: 'SERVER',
      authenModeOptions,
      accountOptions: [],
      hideSuspend: false,
      authenOptions: {
        BATCH: '批量认证',
        SINGLE: '单一认证'
      }
    }
  },
  created () {
    this.getAccountList(this)
  },
  computed: {
    authenModeOptionsList () {
      if (this.executeType == 'saltStack') {
        return {
          TRUST: '互信认证'
        }
      } else {
        return this.authenModeOptions
      }
    }
  },
  methods: {
    getAccountList () {
      getIdent({
        simple: true
      }).then(data => {
        if (data.success) {
          const account = data.data.rows
          account.forEach(data => {
            data.name = data.username
            if (data.remark) {
              data.name = `${data.username}(${data.remark})`
            }
          })
          this.accountOptions = account
        }
      })
    },
    selectMode () {
      if (this.itemData.authenMode !== 'BATCH') {
        this.itemData.identId = ''
      }
    },
    getPostData () {
      let data = false
      this.$refs[`${this.typeName}_form`].validate(valid => {
        if (valid) {
          data = cloneDeep(this.itemData);
          // 目标机器数据处理
          data.hostList.forEach(item => {
            item.pasd = encrypt(item.pasd)
            delete item.privateIps
            delete item.isLoaded
          })
        }
      })
      return data
    }
  }
}
</script>
