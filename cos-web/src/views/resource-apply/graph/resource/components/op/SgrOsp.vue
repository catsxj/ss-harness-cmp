<template>
  <basic-form :model="itemData" ref="form">
    <el-form-item label="协议类型：" prop="protocol" validate="required">
      <el-radio-group v-model="itemData.protocol" size="small" :disabled="isPreview">
        <el-radio :label="item.name" border v-for="(item, index) in protocolType" :key="index">{{ item.name }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="规则方向：" prop="direction" validate="required">
      <el-radio-group v-model="itemData.direction" size="small" :disabled="isPreview">
        <el-radio :label="item.value" border v-for="(item, index) in ruleDirecion" :key="index">{{ item.name }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <basic-form-item label="起始端口：" prop="portMin" v-if="itemData.protocol != 'ICMP'" validate="required" required-message="请输入起始端口">
      <el-input-number v-model="itemData.portMin" :disabled="isPreview" style="width: 100%" :min="1" :max="65535"></el-input-number>
    </basic-form-item>
    <basic-form-item label="结束端口：" prop="portMax" v-if="itemData.protocol != 'ICMP'" validate="required" required-message="请输入结束端口">
      <el-input-number v-model="itemData.portMax" :disabled="isPreview" style="width: 100%" :min="1" :max="65535"></el-input-number>
    </basic-form-item>
    <el-form-item label="CIDR：" prop="remoteIpPrefix">
      <el-input v-model="itemData.remoteIpPrefix" :disabled="isPreview"></el-input>
    </el-form-item>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          origin: 'create',
          direction: 'ingress',
          protocol: 'TCP'
        }
      }
    }
  },
  data() {
    return {
      protocolType: [{ name: 'TCP' }, { name: 'UDP' }, { name: 'ICMP' }],
      ruleDirecion: [
        { name: '入口', value: 'ingress' },
        { name: '出口', value: 'egress' }
      ],
      listData: []
    }
  },
  created() {},
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.itemData.portMax < this.itemData.portMin) return this.$message.error('结束端口不得小于起始端口')
          data = this.itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
