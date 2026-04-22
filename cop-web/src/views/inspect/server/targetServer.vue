<template>
  <div>
    <el-tabs v-model="typeName"  type="border-card" @tab-click="handleClick">
      <el-tab-pane name="SERVER" label="CMDB主机" :disabled="isview">
        <basic-form :ref="`${typeName}_form`" :model="itemData" :disabled="disable">
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
            <el-col :span="12" v-if="itemData.executeType == 'remote'">
              <basic-form-item label="是否sudo：">
                <el-switch v-model="itemData.sudo" active-color="#13ce66"
                            inactive-color="#ff4949"></el-switch>
              </basic-form-item>
            </el-col>
          </el-row>
          <select-server :itemData="itemData" :has-resource="true"></select-server>
        </basic-form>
      </el-tab-pane>
      <el-tab-pane name="NETWORKDEVICE" label="CMDB网络设备" v-if="itemData.isJumpServer" :disabled="isview">
        <basic-form :ref="`${typeName}_form`" :model="itemData" v-if="typeName === 'NETWORKDEVICE'" :disabled="disable">
          <el-row :gutter="10">
            <el-col :span="12">
              <basic-form-item label="认证方式：" validate="required" required-message="请选择认证方式" prop="authenMode">
                <el-select v-model="itemData.authenMode" placeholder="认证方式" @change="selectMode(itemData)">
                  <el-option v-for="(value, key) in authenOptions" :key="key" :label="value" :value="key">
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
          </el-row>
          <select-network :itemData="itemData" :has-resource="true"></select-network>
        </basic-form>
      </el-tab-pane>
      <el-tab-pane name="SAFETYDEVICE" label="CMDB安全设备" v-if="itemData.isJumpServer" :disabled="isview">
        <basic-form :ref="`${typeName}_form`" :model="itemData" v-if="typeName === 'SAFETYDEVICE'" :disabled="disable">
          <el-row :gutter="10">
            <el-col :span="12">
              <basic-form-item label="认证方式：" validate="required" required-message="请选择认证方式" prop="authenMode">
                <el-select v-model="itemData.authenMode" placeholder="认证方式" @change="selectMode(itemData)">
                  <el-option v-for="(value, key) in authenOptions" :key="key" :label="value" :value="key">
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
          </el-row>
          <select-safety :itemData="itemData"></select-safety>
        </basic-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { encrypt } from 'utils/crypto'
import { cloneDeep } from 'lodash-es'
import { authenModeOptions } from '@/common/commonData.js'
import SelectServer from 'views/bsm-cache/cmdbServer/middleServer2.vue'
import SelectNetwork from 'views/bsm-cache/cmdbServer/middleNetwork'
import SelectSafety from 'views/bsm-cache/cmdbServer/middleSafety'
import { getIdent } from 'services/task/inspect'
export default {
  components: {
    SelectServer, SelectNetwork, SelectSafety
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
      type: Array,
      required: true
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
      hideSuspend: false,
      authenOptions: {
        BATCH: '批量认证',
        SINGLE: '单一认证'
      }
    }
  },
  computed: {
    account () {
      return this.$store.state.inspect.account
    },
    authenModeOptionsList () {
      if (this.itemData.executeType == 'saltStack') {
        return {
          TRUST: '互信认证'
        }
      } else {
        return this.authenModeOptions
      }
    }
  },
  watch: {
    showTabList: {
      deep: true,
      handler (val) {
        if (this.itemData.resourceType === 'CMDB_SECURITY_DEVICE') {
          this.typeName = 'SAFETYDEVICE'
        } else if (this.itemData.resourceType === 'CMDB_NETWORK_DEVICE') {
          this.typeName = 'NETWORKDEVICE'
        } else {
          this.typeName = 'SERVER'
        }
      }
    },
    'itemData.resourceType': {
      handler (val) {
        switch (val) {
          case 'CMDB_HOST':
            this.typeName = 'SERVER'
            break;
          case 'CMDB_NETWORK_DEVICE':
            this.typeName = 'NETWORKDEVICE'
            break;
          case 'CMDB_SECURITY_DEVICE':
            this.typeName = 'SAFETYDEVICE'
            break;
        }
      }
    }
  },
  methods: {
    handleClick (flag) {
      this.itemData.authenMode = 'SINGLE'
      this.itemData.identId = ''
      this.itemData.hostList = []
      switch (this.typeName) {
        case 'SERVER':
          this.itemData.resourceType = 'CMDB_HOST'
          break;
        case 'NETWORKDEVICE':
          this.itemData.resourceType = 'CMDB_NETWORK_DEVICE'
          break;
        case 'SAFETYDEVICE':
          this.itemData.resourceType = 'CMDB_SECURITY_DEVICE'
          break;
      }
    },
    getAccountList () {
      // 对执行账户数据进行缓存，避免建立多个资源组是重复调用接口
      if (this.account?.length > 0) {
        this.accountOptions = this.account
        return
      }
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
          this.$store.commit('SET_ACCOUNT', account)
        }
      })
    },
    selectMode () {
      if (this.itemData.authenMode !== 'BATCH') {
        this.itemData.identId = ''
      } else {
        this.getAccountList()
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
