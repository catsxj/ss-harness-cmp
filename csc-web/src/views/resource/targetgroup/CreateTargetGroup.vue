<template>
  <el-dialog title="新增目标群组" :visible.sync="addData.createVisible" width="45%">
    <basic-form :model="addData.data" ref="data" label-width="130px">
      <vendor :add-data="addData" vendorType="AWS" @vendorId="changeRegion"></vendor>
      <basic-form-item label="类型：">
        <el-radio-group v-model="addData.data.type">
          <el-radio label="instance">实例</el-radio>
          <el-radio label="ip">IP地址</el-radio>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="目标群组名称：" prop="name" validate="required" required-message="请输入目标群组名称">
        <el-input type="text" v-model="addData.data.name" placeholder="请输入目标群组的名称"></el-input>
      </basic-form-item>
      <basic-form-item label="协议端口：">
        <el-select style="width: 100px" v-model="addData.data.protocol" placeholder="请选择协议" @change="changePort">
          <el-option label="HTTP" value="HTTP"></el-option>
          <el-option label="HTTPS" value="HTTPS"></el-option>
          <el-option label="TCP" value="TCP"></el-option>
          <el-option label="TLS" value="TLS"></el-option>
          <el-option label="UDP" value="UDP"></el-option>
          <el-option label="TCP_UDP" value="TCP_UDP"></el-option>
        </el-select>
        :
        <el-input style="width: 100px" placeholder="请输入端口" v-model="addData.data.port"></el-input>
      </basic-form-item>
      <basic-form-item label="VPC：" validate="required" prop="vpcStore">
        <el-select v-model="addData.data.vpcStore" filterable @change="vpcChange(addData.data.vpcStore)">
          <el-option v-for="(item, index) in vpcList" :key="index" :label="`${item.name}${item.vpcId}${item.cidr}`" :value="[`${item.vpcId}`, ` ${item.id}`]"> </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item v-if="protocolVersionVisible" label="协议版本：">
        <el-radio-group v-model="addData.data.protocolVersion" @change="changeProtocolVersion">
          <el-radio label="HTTP1">HTTP1</el-radio>
          <el-radio label="HTTP2">HTTP2</el-radio>
          <el-radio label="GRPC">gRPC</el-radio>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="健康检查协议：">
        <el-select style="width: 100px" v-model="addData.data.healthCheckProtocol" @change="changeHealthCheckProtocol" placeholder="请选择协议">
          <el-option label="TCP" value="TCP" v-if="optionVisible"></el-option>
          <el-option label="HTTP" value="HTTP"></el-option>
          <el-option label="HTTPS" value="HTTPS"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="健康检查路径：" v-if="pathVisible">
        <el-input v-model="addData.data.healthCheckPath"></el-input>
      </basic-form-item>
      <el-collapse>
        <el-collapse-item title="高级健康检查设置：">
          <basic-form-item label="端口：">
            <el-radio-group v-model="healthCheckPortInstead" @change="healthPortChange">
              <el-radio label="traffic-port">Traffic Port</el-radio>
              <el-radio label="override">Override</el-radio>
            </el-radio-group>
            <el-input v-if="healthCheckPortInstead === 'override'" style="width: 150px; margin-left: 16px" placeholder="请输入端口" v-model="portInstead" type="number" @change="changePortInstead"></el-input>
            <el-tooltip v-if="healthCheckPortInstead === 'override'" class="item" effect="dark" content="1-65535" placement="right"> <i style="color: #2c8cf0; margin-left: 10px" class="el-icon-info"></i></el-tooltip>
          </basic-form-item>
          <basic-form-item label="健康阈值：">
            <el-input style="width: 150px" type="number" placeholder="请输入健康阈值" v-model="addData.data.healthyThresholdCount"></el-input>
            <el-tooltip class="item" effect="dark" content="2-10" placement="right"> <i style="color: #2c8cf0; margin-left: 10px" class="el-icon-info"></i></el-tooltip>
          </basic-form-item>
          <basic-form-item label="不健康阈值：">
            <el-input :disabled="isUnhealth" style="width: 150px" type="number" v-model="addData.data.unhealthyThresholdCount"></el-input>
            <el-tooltip class="item" effect="dark" content="2-10" placement="right"> <i style="color: #2c8cf0; margin-left: 10px" class="el-icon-info"></i></el-tooltip>
          </basic-form-item>
          <basic-form-item label="超时：">
            <el-input :disabled="isTimeoutDisabled" type="number" v-model="addData.data.healthCheckTimeoutSeconds" value="6" style="width: 150px"></el-input>
            <span style="margin-left: 10px">秒</span>
            <el-tooltip v-if="!isTimeoutDisabled" class="item" effect="dark" content="2-120" placement="right"> <i style="color: #2c8cf0; margin-left: 10px" class="el-icon-info"></i></el-tooltip>
          </basic-form-item>
          <basic-form-item label="间隔：">
            <div v-if="intervalVisible">
              <el-input style="width: 150px" type="number" v-model="addData.data.healthCheckIntervalSeconds"></el-input>
              <span style="margin-left: 10px">秒</span>
              <el-tooltip class="item" effect="dark" content="5-300" placement="right"> <i style="color: #2c8cf0; margin-left: 10px" class="el-icon-info"></i></el-tooltip>
            </div>
            <div v-if="!intervalVisible">
              <el-radio-group v-model="addData.data.healthCheckIntervalSeconds">
                <el-radio :label="10">10 秒</el-radio>
                <el-radio :label="30">30 秒</el-radio>
              </el-radio-group>
            </div>
          </basic-form-item>
          <basic-form-item label="成功码：" v-if="successCodeVisible">
            <el-input v-if="codeVisible" :disabled="isDisabled" v-model="addData.data.httpCode" style="width: 150px"></el-input>
            <el-input v-if="!codeVisible" v-model="addData.data.grpcCode" style="width: 150px"></el-input>
          </basic-form-item>
        </el-collapse-item>
      </el-collapse>
    </basic-form>
    <div slot="footer">
      <el-button type="ghost" @click="addData.createVisible = false">取消</el-button>
      <el-button type="primary" @click="ok">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createTargetGroup, getRegion, getVpc } from 'services/platform/aws'
import { batchRemoveIpAccess } from 'services/system/ip_access'
import vendor from '@/components/publicPool/index.vue'

export default {
  name: 'CreateTargetGroup',
  components: { vendor },
  props: {
    addData: {
      type: Object,
      default() {
        return {
          data: {},
          createVisible: false
        }
      }
    }
  },
  data() {
    return {
      regionList: [],
      vpcList: [],
      vpcStore: null,
      healthCheckPortInstead: 'traffic-port',
      portInstead: '80',
      optionVisible: false,
      pathVisible: true,
      codeVisible: true,
      protocolVersionVisible: true,
      successCodeVisible: true,
      isDisabled: false,
      intervalVisible: true,
      isTimeoutDisabled: false, // 默认不置灰
      isUnhealth: false // 默认不健康阈值不置灰
    }
  },
  methods: {
    changeHealthCheckProtocol() {
      switch (this.addData.data.healthCheckProtocol) {
        case 'HTTP':
          this.pathVisible = true
          if (['TCP', 'TLS', 'UDP', 'TCP_UDP'].includes(this.addData.data.protocol)) {
            this.addData.data.healthCheckPath = '/'
            this.successCodeVisible = true
            this.addData.data.httpCode = '200-399'
            this.isDisabled = true // 置灰
            this.intervalVisible = false
            this.addData.data.healthCheckIntervalSeconds = 30
            this.isTimeoutDisabled = true // 超时置灰
            this.addData.data.healthCheckTimeoutSeconds = 6
            this.isUnhealth = true // 不健康阈值置灰
            this.addData.data.unhealthyThresholdCount = 3
            this.addData.data.healthyThresholdCount = 3
          }
          break
        case 'HTTPS':
          this.pathVisible = true
          if (['TCP', 'TLS', 'UDP', 'TCP_UDP'].includes(this.addData.data.protocol)) {
            this.addData.data.healthCheckPath = '/'
            this.successCodeVisible = true
            this.addData.data.httpCode = '200-399'
            this.isDisabled = true // 成功码置灰
            this.intervalVisible = false
            this.addData.data.healthCheckIntervalSeconds = 30
            this.isTimeoutDisabled = true
            this.addData.data.healthCheckTimeoutSeconds = 10
            this.isUnhealth = true // 不健康阈值置灰
            this.addData.data.unhealthyThresholdCount = 3
            this.addData.data.healthyThresholdCount = 3
          }
          break
        case 'TCP':
          this.pathVisible = false
          this.addData.data.healthCheckPath = undefined
          // 当健康协议检查为TCP的时候 成功码不显示
          if (['TCP', 'TLS', 'UDP', 'TCP_UDP'].includes(this.addData.data.protocol)) {
            this.successCodeVisible = false
            this.addData.data.httpCode = undefined
            this.addData.data.grpcCode = undefined
            // 此时interval变成单选框的形式
            this.intervalVisible = false
            this.addData.data.healthCheckIntervalSeconds = 30
            this.isTimeoutDisabled = true
            this.addData.data.healthCheckTimeoutSeconds = 10
            this.isUnhealth = true // 不健康阈值置灰
            this.addData.data.unhealthyThresholdCount = 3
            this.addData.data.healthyThresholdCount = 3
          }
          break
      }
    },
    changePortInstead() {
      this.addData.data.healthCheckPort = this.portInstead
    },
    healthPortChange() {
      switch (this.healthCheckPortInstead) {
        case 'traffic-port':
          this.addData.data.healthCheckPort = 'traffic-port'
          break
        case 'override':
          this.addData.data.healthCheckPort = this.portInstead
      }
    },
    changeProtocolVersion() {
      switch (this.addData.data.protocolVersion) {
        case 'HTTP1':
          this.addData.data.healthCheckPath = '/'
          this.codeVisible = true
          this.addData.data.httpCode = 200
          this.addData.data.grpcCode = undefined
          break
        case 'HTTP2':
          this.addData.data.healthCheckPath = '/'
          this.codeVisible = true
          this.addData.data.httpCode = 200
          this.addData.data.grpcCode = undefined
          break
        case 'GRPC':
          this.addData.data.healthCheckPath = '/AWS.ALB/healthcheck'
          this.codeVisible = false
          this.addData.data.grpcCode = '12'
          this.addData.data.httpCode = undefined
      }
    },
    changePort() {
      switch (this.addData.data.protocol) {
        case 'HTTP':
          this.addData.data.port = '80'
          this.optionVisible = false
          this.addData.data.healthCheckProtocol = 'HTTP'
          // 成功码取消置灰重新赋值
          this.successCodeVisible = true
          this.codeVisible = true
          this.isDisabled = false
          this.addData.data.httpCode = 200
          // 间隔恢复可选框
          this.intervalVisible = true
          this.addData.data.healthCheckIntervalSeconds = 30
          // 不健康阈值
          this.isUnhealth = false // 不健康阈值取消置灰
          this.addData.data.unhealthyThresholdCount = 2
          this.addData.data.healthyThresholdCount = 5
          // this.pathVisible = true
          this.protocolVersionVisible = true
          this.addData.data.protocolVersion = 'HTTP1'
          this.changeHealthCheckProtocol()
          this.changeProtocolVersion()
          break
        case 'HTTPS':
          this.addData.data.port = '443'
          this.optionVisible = false
          this.addData.data.healthCheckProtocol = 'HTTPS'
          // 成功码取消置灰重新赋值
          this.successCodeVisible = true
          this.codeVisible = true
          this.isDisabled = false
          this.addData.data.httpCode = 200
          // 间隔恢复可选框
          this.intervalVisible = true
          this.addData.data.healthCheckIntervalSeconds = 30
          // 不健康阈值
          this.isUnhealth = false // 不健康阈值取消置灰
          this.addData.data.unhealthyThresholdCount = 2
          this.addData.data.healthyThresholdCount = 5
          // this.pathVisible = true
          this.protocolVersionVisible = true
          this.addData.data.protocolVersion = 'HTTP1'
          this.changeHealthCheckProtocol()
          this.changeProtocolVersion()
          break
        case 'TCP':
          this.addData.data.port = '80'
          this.optionVisible = true
          this.addData.data.healthCheckProtocol = 'TCP'

          // this.pathVisible = false
          // this.addData.data.healthCheckPath = undefined
          this.protocolVersionVisible = false
          this.addData.data.protocolVersion = undefined
          this.changeHealthCheckProtocol()
          break
        case 'TLS':
          this.addData.data.port = '443'
          this.optionVisible = true
          this.addData.data.healthCheckProtocol = 'TCP'
          this.changeHealthCheckProtocol()

          // this.pathVisible = false
          // this.addData.data.healthCheckPath = undefined
          this.protocolVersionVisible = false
          this.addData.data.protocolVersion = undefined
          break
        case 'UDP':
          this.addData.data.port = '53'
          this.optionVisible = true
          this.addData.data.healthCheckProtocol = 'TCP'
          this.changeHealthCheckProtocol()

          // this.pathVisible = false
          // this.addData.data.healthCheckPath = undefined
          this.protocolVersionVisible = false
          this.addData.data.protocolVersion = undefined
          break
        case 'TCP_UDP':
          this.addData.data.port = '53'
          this.optionVisible = true
          this.addData.data.healthCheckProtocol = 'TCP'
          this.changeHealthCheckProtocol()
          // this.pathVisible = false
          // this.addData.data.healthCheckPath = undefined
          this.protocolVersionVisible = false
          this.addData.data.protocolVersion = undefined
          break
      }
    },
    vpcChange(temp) {
      this.addData.data.vpcId = Number(temp[1])
      this.addData.data.vpcUuid = temp[0]
      console.log(temp)
    },

    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createTargetGroup(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.createVisible = false
              this.$emit('back')
            }
          })
        }
      })
    },
    changeRegion() {
      this.getVpc()
    },
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([
          { param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' },
          {
            param: {
              regionId: this.addData.data.regionId
            },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.vpcList = data.data.rows
        }
      })
    }
  }
}
</script>

<style scoped></style>
