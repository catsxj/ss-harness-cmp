<template>
  <div>
    <el-tabs v-model="typeName" type="border-card">
      <el-tab-pane name="SERVER" label="CMDB主机">
        <basic-form ref="form" labelWidth="120px" :model="itemData" :disabled="disable">
          <el-row :gutter="10">
            <el-col :span="12">
              <basic-form-item label="认证方式：" validate="required" required-message="请选择认证方式" prop="jumpServer.authenMode">
                <el-select v-model="itemData.jumpServer.authenMode" placeholder="认证方式" @change="selectMode(itemData)">
                  <el-option v-for="(value, key) in authenModeOptions" :key="key" :label="value" :value="key">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="12" v-if="itemData.jumpServer.authenMode === 'BATCH'">
              <basic-form-item label="执行账户:"  prop="jumpServer.identId" validate="required">
                <el-select v-model="itemData.jumpServer.identId" placeholder="请选择执行账户">
                  <el-option v-for="item in accountOptions" :key="item.id" :label="item.name" :value="item.id">
                  </el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="12">
              <basic-form-item label="是否sudo：">
                <el-switch v-model="itemData.jumpServer.sudo" active-color="#13ce66"
                            inactive-color="#ff4949"></el-switch>
              </basic-form-item>
            </el-col>
          </el-row>
          <select-server :itemData="itemData"></select-server>
        </basic-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { encrypt } from 'utils/crypto'
import { cloneDeep } from 'lodash-es'
import { authenModeOptions } from '@/common/commonData.js'
import SelectServer from './selectServer.vue'
import { getIdent } from 'services/task/inspect'
export default {
  components: {
    SelectServer
  },
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          jumpServer: {
            authenMode: 'SINGLE',
            sudo: true,
            identId: '',
            hostList: []
          }
        }
      }
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      typeName: 'SERVER',
      authenModeOptions,
      accountOptions: [],
      hideSuspend: false
    }
  },
  created () {
    this.getAccountList(this)
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
      if (this.itemData.jumpServer.authenMode !== 'BATCH') {
        this.itemData.jumpServer.identId = ''
      }
    },
    getPostData () {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          data = cloneDeep(this.itemData);
          // 目标机器数据处理
          data.jumpServer.hostList.forEach(item => {
            item.pasd = encrypt(item.pasd)
            delete item.privateIps
            delete item.isLoaded
          })
        }
      })
      return data.jumpServer
    }
  }
}
</script>
