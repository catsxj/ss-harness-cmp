<template>
  <div>
    <el-dialog title="新增安全组规则" :visible.sync="addData.dialog" width="70%" top="7vh">
      <el-form ref="addData" :model="addData.data" :status-icon="true" label-width="120px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="协议类型：" prop="protocol" validate="required">
              <el-select v-model="addData.data.protocol" clearable>
                <el-option label="Tcp" value="Tcp"></el-option>
                <el-option label="Udp" value="Udp"></el-option>
                <el-option label="Icmp" value="Icmp"></el-option>
                <el-option label="*" value="*"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="addData.needDirection" style="height: 51px">
            <el-form-item label="规则方向：" prop="direction" v-if="addData.needDirection">
              <el-radio-group v-model="addData.data.direction" size="small">
                <el-radio v-for="(item, index) in ruleDirecion" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8" style="height: 51px">
            <el-form-item label="action：" prop="action">
              <el-radio-group v-model="addData.data.action" size="small">
                <el-radio v-for="(item, index) in action" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <span slot="label">
                源：
                <el-tooltip class="item" effect="dark" content="源过滤器可为“任意”、一个 IP 地址范围、一个应用程序安全组或一个默认标记。它指定此规则将允许或拒绝的特定源 IP 地址范围的传入流量。" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-select v-model="sourceType">
                <el-option label="Any" value="Any"></el-option>
                <el-option label="IP Addresses" value="ip"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="sourceAddressPrefix" :rules="rules" v-if="sourceType == 'ip'" key="sourceAddressPrefix">
              <span slot="label">
                源地址：
                <el-tooltip class="item" effect="dark" content="提供采用 CIDR 表示法的地址范围(例如 192.168.99.0/2)或提供 IP 地址(例如 192.168.99.0)" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="addData.data.sourceAddressPrefix" placeholder="多个地址用,隔开(例如: 192.168.99.0/2,192.168.99.0)"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目标：">
              <span slot="label">
                目标：
                <el-tooltip class="item" effect="dark" content="目标筛选器可为“任意”、一个 IP 地址范围、一个应用程序安全组或一个默认标记。它指定此规则将允许或拒绝的特定目标 IP 地址范围的传出流量。" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-select v-model="destination">
                <el-option label="Any" value="Any"></el-option>
                <el-option label="IP Addresses" value="ip"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="destinationAddressPrefix" :rules="rules" v-if="destination == 'ip'" key="destinationAddressPrefix">
              <span slot="label">
                目的地址：
                <el-tooltip class="item" effect="dark" content="提供采用 CIDR 表示法的地址范围(例如 192.168.99.0/2)或提供 IP 地址(例如 192.168.99.0)" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="addData.data.destinationAddressPrefix" placeholder="多个地址用,隔开(例如: 192.168.99.0/2,192.168.99.0)"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="sourcePortRange" :rules="rules2">
              <span slot="label">
                源端口：
                <el-tooltip class="item" effect="dark" content="提供单个端口(如 80)、端口范围(如 1024-65535)，或单个端口和/或端口范围的以逗号分隔的列表(如 80,1024-65535)。这指定了根据此规则将允许或拒绝哪些端口的流量。提供星号(*)可允许任何端口的流量。" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="addData.data.sourcePortRange"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="destinationPortRange" :rules="rules2">
              <span slot="label">
                目的端口：
                <el-tooltip class="item" effect="dark" content="提供单个端口(如 80)、端口范围(如 1024-65535)，或单个端口和/或端口范围的以逗号分隔的列表(如 80,1024-65535)。这指定了根据此规则将允许或拒绝哪些端口的流量。提供星号(*)可允许任何端口的流量。" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="addData.data.destinationPortRange"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="priority" :rules="[{ required: true, message: '该字段为必填字段' }]">
              <span slot="label">
                优先级：
                <el-tooltip class="item" effect="dark" content="根据优先级顺序处理规则；数字越小，优先级越高。我们建议在规则之间留出间隙 - 100、200、300 等 - 这样一来便可在无需编辑现有规则的情况下添加新规则。" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input-number v-model="addData.data.priority" :min="100" :max="4096" style="width: 100%" :controls="false"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <basic-form-item label="描述：" prop="remark">
              <el-input v-model="addData.data.remark"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createGroupRule } from 'services/platform/index'
var validate1 = (rule, value, callback) => {
  const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  const reg1 = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/(\d{3}\d{2}|\d{1,2}\d|\d))?$/
  if (reg.test(value) || reg1.test(value) || !value) {
    callback()
  } else {
    callback(new Error('请输入正确的地址'))
  }
}
var validate2 = (rule, value, callback) => {
  if (!value) {
    callback()
  } else {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    const reg1 = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/(\d{3}\d{2}|\d{1,2}\d|\d))?$/
    const list = value.split(',')
    list.forEach(item => {
      if (!reg.test(item) && !reg1.test(item)) {
        callback(new Error('请按照提示输入'))
      }
    })
    callback()
  }
}
var validate3 = (rule, value, callback) => {
  if (!value) {
    callback()
  } else {
    const testList = []
    const reg = /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
    const reg1 = /[*]+/
    const list = value.toString().split(',')
    list.forEach(function (item) {
      item.split('-').forEach(function (t) {
        testList.push(t)
      })
    })
    testList.forEach(item => {
      if (!reg.test(item) && !reg1.test(item)) {
        callback(new Error('请按照提示输入'))
      }
    })
    callback()
  }
}
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      protocolType: [{ name: 'Tcp' }, { name: 'Udp' }, { name: 'Icmp' }, { name: '*' }],
      ruleDirecion: [
        { name: '出站', value: 'Outbound' },
        { name: '入站', value: 'Inbound' }
      ],
      action: [
        { name: '允许', value: 'Allow' },
        { name: '拒绝', value: 'Deny' }
      ],
      loading: false,
      rules: [{ required: true, message: '该字段为必填字段' }, { validator: validate2 }],
      rules2: [{ required: true, message: '该字段为必填字段' }, { validator: validate3 }],
      sourceType: 'Any',
      destination: 'Any'
    }
  },
  methods: {
    ok() {
      this.$refs.addData.validate(valid => {
        if (valid) {
          this.loading = true
          console.log(this.addData.data.sourceAddressPrefix)
          createGroupRule({
            ...this.addData.data,
            sourceAddressPrefix: this.sourceType == 'Any' ? 'Any' : this.addData.data.sourceAddressPrefix.split(','),
            destinationAddressPrefix: this.destination == 'Any' ? 'Any' : this.addData.data.destinationAddressPrefix.split(','),
            sourcePortRange: this.addData.data.sourcePortRange == '*' ? '*' : this.addData.data.sourcePortRange.split(','),
            destinationPortRange: this.addData.data.destinationPortRange == '*' ? '*' : this.addData.data.destinationPortRange.split(',')
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style>
.vm-region {
  height: 42px;
  width: 110px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 10px 0 0;
  border: 1px solid #ddd;
  line-height: 42px;
  font-size: 12px;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-radius: 0;
  display: inline-block;
}

.vm-region:hover {
  border-color: #43bfe3 !important;
}

.vm-region-text {
  border-color: #43bfe3 !important;
}

.region-active {
  background-color: deepskyblue;
  color: #fff;
}
</style>
