<template>
  <basic-form ref="addData" :model="addData" :status-icon="true" label-width="100px">
    <basic-form-item label="协议类型：" prop="protocol">
      <el-radio-group v-model="addData.protocol" size="small" @change="protocolChange()">
        <el-radio v-for="(item, index) in protocolType" :key="index" :label="item.name" border></el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="规则方向：" prop="direction">
      <el-radio-group v-model="addData.direction" size="small">
        <el-radio v-for="(item, index) in ruleDirecion" :key="index" :label="item.value" border>{{item.name}}</el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="起始端口：" prop="portMin" validate="required,number" v-if="addData.protocol != 'ICMP'">
      <el-input v-model.number="addData.portMin"></el-input>
    </basic-form-item>
    <basic-form-item label="结束端口：" prop="portMax" validate="required,number" v-if="addData.protocol != 'ICMP'">
      <el-input v-model.number="addData.portMax"></el-input>
    </basic-form-item>
    <basic-form-item label="CIDR：" prop="remoteIpPrefix" validate="required,ipORcidr">
      <el-input v-model="addData.remoteIpPrefix"></el-input>
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
      protocolType: [{ name: 'TCP' }, { name: 'UDP' }, { name: 'ICMP' }],
      ruleDirecion: [{ name: '入口', value: 'ingress' }, { name: '出口', value: 'egress' }]
    }
  },
  methods: {
    getPostData() {
      let addData = ''
      this.$refs.addData.validate(valid => {
        if (valid) {
          if ((this.addData.portMin >= this.addData.portMax) && this.addData.protocol != 'ICMP') {
            return this.$message.error('起始端口不能大于结束端口')
          } else {
            addData = this.addData
          }
        }
      })
      return addData
    },
    protocolChange (item) {
      this.addData.portMin = ''
      this.addData.portMax = ''
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
<style scoped>
.info {
  font-size: 12px;
  color: #a6a6a6;
  line-height: 32px;
  margin-left: 8px;
}
</style>
