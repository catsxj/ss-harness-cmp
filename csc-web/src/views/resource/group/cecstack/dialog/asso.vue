<template>
  <el-dialog title="绑定安全组至资源" width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
    <basic-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
      <el-row>
        <el-col :span="24">
          <p style="padding: 0 20px; line-height: 27px">您正在为安全组 {{ addData.groupUuid }} 绑定云资源</p>
        </el-col>
        <el-col :span="24">
          <!-- 实例 -->
          <basic-form-item label="实例类型：" prop="securityGroupType" validate="required">
            <el-select v-model="addData.data.securityGroupType" filterable @change="changeType">
              <el-option v-for="item in instanceTypeList" :key="item.value" :label="item.name" :value="item.value">{{ item.name }}</el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 实例 -->
          <basic-form-item label="实例：" prop="instanceId" validate="required" required-message="请选择实例">
            <template v-if="addData.data.securityGroupType === 'ECS'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="item in list" :key="item.instanceId" :label="item.name" :value="item.instanceId">{{ item.name }}( {{ item.instanceId }} )</el-option>
              </el-select>
            </template>
            <template v-if="addData.data.securityGroupType === 'Nat'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="item in list" :key="item.uuid" :label="item.name" :value="item.uuid">{{ item.name }}( {{ item.uuid }} )</el-option>
              </el-select>
            </template>
            <template v-if="addData.data.securityGroupType === 'SlbInstance'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="item in list" :key="item.lbUuid" :label="item.name" :value="item.lbUuid">{{ item.name }}( {{ item.lbUuid }} )</el-option>
              </el-select>
            </template>
            <template v-if="addData.data.securityGroupType === 'ENI'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="item in list" :key="item.networkcardUuid" :label="`${item.name}（${item.networkcardUuid}）`" :value="item.networkcardUuid"></el-option>
              </el-select>
            </template>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { conditionVm, getAliEigs, getNetworkcard, getAliElbs, patchGroups } from 'services/platform/index'
const instanceTypeList = [
  {
    name: '云主机实例',
    value: 'ECS'
  },
  // {
  //   name: 'NAT网关',
  //   value: 'Nat'
  // },
  // {
  //   name: '负载均衡实例',
  //   value: 'SlbInstance'
  // },
  {
    name: '弹性网卡',
    value: 'ENI'
  }
]
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      instanceTypeList,
      list: [],
      loading: false
    }
  },
  created() {
    this.getInstance()
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          patchGroups('association', this.addData.data)
            .then(data => {
              const type = data.success ? 'success' : 'error'
              this.$message({
                type: type,
                message: data.message
              })
              this.resetAssociateForm()
              this.addData.dialog = false
              this.$emit('goBack')
            })
            .finally(() => (this.loading = false))
        }
      })
    },
    resetAssociateForm() {
      this.$refs.data.resetFields()
    },
    changeType(val) {
      if (val === 'ECS') {
        this.getInstance()
      }
      if (val === 'Nat') {
        this.getEigs()
      }
      if (val === 'SlbInstance') {
        this.getElbs()
      }
      if (val === 'ENI') {
        this.getEnis()
      }
    },
    getInstance() {
      conditionVm({
        condition: 'AvailableVm',
        vendorId: this.addData.vendorId,
        regionId: this.addData.regionId
      }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    getEigs() {
      getAliEigs({
        vendorId: this.addData.vendorId,
        regionId: this.addData.regionId
      }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    getEnis() {
      getNetworkcard({
        page: 1,
        rows: 999,
        params: JSON.stringify([{ param: { vendorId: this.addData.vendorId, regionId: this.addData.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows.filter(({ serverName, serverId }) => serverName || serverId)
        }
      })
    },
    getElbs() {
      getAliElbs({
        vendorId: this.addData.vendorId,
        regionId: this.addData.regionId
      }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    }
  }
}
</script>
