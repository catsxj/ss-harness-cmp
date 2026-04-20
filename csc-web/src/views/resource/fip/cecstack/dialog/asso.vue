<template>
  <el-dialog title="绑定弹性公网IP至资源" width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
    <basic-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
      <el-row>
        <el-col :span="24">
          <p style="padding: 0 20px; line-height: 27px">您正在为弹性公网IP {{ addData.elasticIpUuid }}（{{ addData.publicIp }}）绑定云资源</p>
        </el-col>
        <el-col :span="24">
          <!-- 实例 -->
          <basic-form-item label="实例类型：" prop="instanceType" validate="required">
            <el-select v-model="addData.data.instanceType" filterable @change="changeType">
              <el-option v-for="item in instanceTypeList" :key="item.value" :label="item.name" :value="item.value">{{ item.name }}</el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 实例 -->
          <basic-form-item label="实例：" prop="instanceId" validate="required" required-message="请选择实例">
            <template v-if="addData.data.instanceType === 'EcsInstance'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.instanceId">{{ item.name }}( {{ item.instanceId }} )</el-option>
              </el-select>
            </template>
            <template v-if="addData.data.instanceType === 'Nat'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.uuid">{{ item.name }}( {{ item.uuid }} )</el-option>
              </el-select>
            </template>
            <template v-if="addData.data.instanceType === 'SlbInstance'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.lbUuid">{{ item.name }}( {{ item.lbUuid }} )</el-option>
              </el-select>
            </template>
            <template v-if="addData.data.instanceType === 'NetworkInterface'">
              <el-select v-model="addData.data.instanceId" filterable>
                <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.networkInterfaceUuid">{{ item.name }}( {{ item.networkInterfaceUuid }} )</el-option>
              </el-select>
            </template>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { conditionVm, getAliEigs, getAliEnis, getAliElbs, associateElasticipsIp } from 'services/platform/index'
const instanceTypeList = [
  {
    name: '云主机实例',
    value: 'EcsInstance'
  },
  // {
  //   name: 'NAT网关',
  //   value: 'Nat'
  // },
  {
    name: '负载均衡实例',
    value: 'SlbInstance'
  }
  // {
  //   name: '辅助弹性网卡',
  //   value: 'NetworkInterface'
  // }
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
      instanceList: [],
      igList: [],
      niList: [],
      lbList: []
    }
  },
  created() {
    this.getInstance()
  },
  mounted() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (!valid) {
          return false
        }
        const sendParam = {
          action: 'association',
          ...this.addData.data
        }
        associateElasticipsIp(this.addData.associateId, sendParam).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message({
            type: type,
            message: data.message
          })
          this.resetAssociateForm()
          this.addData.dialog = false
          this.$emit('goBack')
        })
      })
    },
    resetAssociateForm() {
      this.$refs.data.resetFields()
    },
    changeType(val) {
      if (val === 'EcsInstance') {
        this.getInstance()
      }
      if (val === 'Nat') {
        this.getEigs()
      }
      if (val === 'SlbInstance') {
        this.getElbs()
      }
      if (val === 'NetworkInterface') {
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
      getAliEnis({
        vendorId: this.addData.vendorId,
        regionId: this.addData.regionId
      }).then(data => {
        if (data.success) {
          this.list = data.data
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
