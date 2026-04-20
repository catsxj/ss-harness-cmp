<template>
  <basic-form ref="addData" :model="addData" :status-icon="true" label-width="100px">
    <basic-form-item label="方向：" prop="direction" validate="required">
      <el-radio-group v-model="addData.direction" size="small">
        <el-radio v-for="(item, index) in ruleDirecion" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="协议：" prop="protocol" validate="required">
      <el-radio-group v-model="addData.protocol" size="small" @change="protocolChange()">
        <el-radio v-for="(item, index) in protocolType" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="类型：" prop="type" validate="required">
      <el-select v-model="addData.type" placeholder="请选择" @change="changeType">
        <el-option label="子网" value="subnet"></el-option>
        <el-option label="IP地址段" value="ip"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="IP地址：" prop="ip" validate="required,ip" v-if="addData.type == 'subnet'" key="1">
      <el-input v-model="addData.ip"></el-input>
    </basic-form-item>
    <basic-form-item label="子网掩码：" prop="netmask" validate="required,mask" v-if="addData.type == 'subnet'" key="2">
      <el-input v-model="addData.netmask"></el-input>
    </basic-form-item>
    <basic-form-item label="起始IP：" prop="startIp" validate="required,ip" v-if="addData.type == 'ip'" key="3">
      <el-input v-model="addData.startIp"></el-input>
    </basic-form-item>
    <basic-form-item label="结束IP：" prop="endIp" validate="required,ip" v-if="addData.type == 'ip'" key="4">
      <el-input v-model="addData.endIp"></el-input>
    </basic-form-item>
    <basic-form-item label="起始端口：" prop="portMin" validate="required" v-if="addData.protocol != 'ICMP'">
      <el-input v-model.number="addData.portMin"></el-input>
    </basic-form-item>
    <basic-form-item label="结束端口：" prop="portMax" validate="required" v-if="addData.protocol != 'ICMP'">
      <el-input v-model.number="addData.portMax"></el-input>
    </basic-form-item>
  </basic-form>
</template>

<script>
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      protocolType: [
        { name: 'TCP', value: 'tcp' },
        { name: 'UDP', value: 'udp' },
        { name: 'Any', value: 'any' }
      ],
      ruleDirecion: [
        { name: '入口', value: '0' },
        { name: '出口', value: '1' }
      ]
    }
  },
  methods: {
    getPostData() {
      let addData = ''
      this.$refs.addData.validate(valid => {
        if (valid) {
          const { groupId, vendorId, protocol, type, portMin, portMax, direction } = this.addData
          if (portMax < portMin) {
            this.$message('结束端口不能小于起始端口')
            return
          }
          let ipRanges
          if (this.addData.ip && this.addData.netmask) {
            ipRanges = `${this.addData.ip}/${this.addData.netmask}`
          } else if (this.addData.startIp && this.addData.endIp) {
            ipRanges = `${this.addData.startIp}-${this.addData.endIp}`
          }
          addData = {
            groupId: groupId,
            vendorId: vendorId,
            protocol: protocol,
            type: type,
            ipRanges: ipRanges,
            portMin: portMin,
            portMax: portMax,
            direction: direction
          }
        }
      })
      return addData
    },
    protocolChange(item) {
      this.addData.portMin = ''
      this.addData.portMax = ''
    },
    changeType() {
      const arr = ['ip', 'netmask', 'startIp', 'endId']
      arr.forEach(item => {
        this.$set(this.addData, item, '')
      })
    }
  },
  created() {}
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
