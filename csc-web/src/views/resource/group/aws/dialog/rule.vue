<template>
  <el-form ref="addData" :model="addData" :status-icon="true" label-width="100px">
    <el-form-item label="协议类型：" prop="protocol">
      <el-radio-group v-model="addData.protocol" size="small" @change="changeProtocol">
        <el-radio v-for="(item, index) in protocolType" :key="index" :label="item.name" border></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="规则方向：" prop="direction">
      <el-radio-group v-model="addData.direction" size="small">
        <el-radio v-for="(item, index) in ruleDirecion" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <basic-form-item label="起始端口：" prop="portMin" validate="required" v-if="addData.protocol !== 'ICMP'">
      <el-input v-model.number="addData.portMin"></el-input>
    </basic-form-item>
    <basic-form-item label="结束端口：" prop="portMax" validate="required" v-if="addData.protocol !== 'ICMP'">
      <el-input v-model.number="addData.portMax"></el-input>
    </basic-form-item>
    <basic-form-item label="IP版本：" prop="props" validate="required">
      <el-radio-group v-model="addData.props" size="small">
        <el-radio v-for="(item, index) in propsList" :key="index" :label="item.name" border></el-radio>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="CIDR：" prop="sourcePortRange" validate="required,ipORcidr" maxlength="1000">
      <el-input v-model="addData.sourcePortRange"></el-input>
    </basic-form-item>
    <basic-form-item label="描述：" prop="remark" validate="required,awsRule">
      <el-input v-model="addData.remark" type="textarea"></el-input>
    </basic-form-item>
  </el-form>
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
      ruleDirecion: [
        { name: '入口', value: 'ingress' },
        { name: '出口', value: 'egress' }
      ],
      propsList: [
        { name: 'IPV4', value: 'IPV4' },
        { name: 'IPV6', value: 'IPV6' }
      ]
    }
  },
  methods: {
    changeProtocol() {
      this.$set(this.addData, 'portMax', '')
      this.$set(this.addData, 'portMin', '')
    },
    getPostData() {
      let addData = ''
      this.$refs.addData.validate(valid => {
        if (valid) {
          if (this.addData.protocol == 'ICMP') {
            this.$set(this.addData, 'portMin', -1)
            this.$set(this.addData, 'portMax', -1)
          }
          addData = this.addData
        }
      })
      return addData
    },
    setPort() {
      this.$set(this.addData, 'sourcePortRange', '')
    },
    protocolChange(item) {
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
