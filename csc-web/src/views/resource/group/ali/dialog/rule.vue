<template>
  <basic-form ref="addData" :model="addData" :status-icon="true" label-width="100px">
    <el-row>
      <el-col :span="24">
        <basic-form-item label="规则方向：" prop="direction" validate="required">
          <el-radio-group v-model="addData.direction" size="small">
            <el-radio v-for="(item, index) in ruleDirecion" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="授权策略：" prop="action" validate="required">
            <el-radio-group v-model="addData.action" size="small">
              <el-radio v-for="(item, index) in actionList" :key="index" :label="item.value" border>{{ item.name }}</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="协议类型：" prop="protocol" validate="required">
            <el-radio-group v-model="addData.protocol" size="small" @change="protocolChange">
              <el-radio v-for="(item, index) in protocolType" :key="index" :label="item.name" border></el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="优先级：" prop="priority" validate="required">
            <el-input-number v-model="addData.priority" :min="1" :max="100"></el-input-number>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="起始端口：" prop="portMin" validate="required,number">
            <el-input v-model.number="addData.portMin" :disabled="flag"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="!flag"><span class="info">取值范围从1到65535</span></el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <basic-form-item label="结束端口：" prop="portMax" validate="required,number">
            <el-input v-model.number="addData.portMax" :disabled="flag"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="!flag"><span class="info">取值范围从1到65535</span></el-col>
      </el-row>
      <el-col :span="24">
        <basic-form-item label="授权对象：" prop="remoteIpPrefix" validate="required" maxlength="1000">
          <el-input v-model="addData.remoteIpPrefix"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="24">
        <basic-form-item label="描述：" prop="remark" validate="aliRemark">
          <el-input v-model="addData.remark" type="textarea"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
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
      protocolType: [{ name: 'TCP' }, { name: 'UDP' }, { name: 'ICMP' }, { name: 'GRE' }, { name: 'ALL' }],
      ruleDirecion: [
        { name: '入口', value: 'ingress' },
        { name: '出口', value: 'egress' }
      ],
      propsList: [{ name: 'IPV4', value: 'IPV4' }],
      actionList: [
        { name: '允许', value: 'Accept' },
        { name: '拒绝', value: 'Drop' }
      ],
      flag: false
    }
  },
  methods: {
    getPostData() {
      let addData = ''
      this.$refs.addData.validate(valid => {
        if (valid) {
          addData = this.addData
        }
      })
      return addData
    },
    setPort() {
      this.$set(this.addData, 'sourcePortRange', '')
    },
    protocolChange(item) {
      console.log(item)
      if (item === 'ICMP' || item === 'GRE' || item === 'ALL') {
        this.flag = true
        this.addData.portMin = '-1'
        this.addData.portMax = '-1'
      } else {
        this.flag = false
        this.addData.portMin = ''
        this.addData.portMax = ''
      }
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
