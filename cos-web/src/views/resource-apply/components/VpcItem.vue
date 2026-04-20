<template>
  <el-row :gutter="20">
    <el-col :span="10">
      <basic-form-item label="专有网络：" validate="required" prop="configs.vpcId">
        <el-select v-model="addData.configs.vpcId" placeholder="请选择" @change="getSubnet">
          <el-option v-for="item in vpcList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </basic-form-item>
    </el-col>
    <el-col :span="10">
      <basic-form-item label="选择子网：" validate="required" prop="configs.subnetId">
        <el-select v-model="addData.configs.subnetId" placeholder="请选择">
          <el-option v-for="item in subnetList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </basic-form-item>
    </el-col>
  </el-row>
</template>
<script>
import { getVpc } from 'services/platform/index'
import { getLogicalSwitch } from 'services/platform/nsx'
const {
  configs: { vpcValidate }
} = window
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      vpcList: [],
      subnetList: [],
      disabledValidate: !vpcValidate
    }
  },
  created() {
    this.getVpc()
  },
  watch: {
    'addData.location.az'() {
      this.getVpc()
    }
  },
  methods: {
    getVpc() {
      // const { az, region } = this.addData.location
      getVpc({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.addData.configs.vpcId = ''
          this.vpcList = data.data.rows
          // 清除子网数据
          this.subnetList = []
          if (this.addData.configs.subnetId) this.addData.configs.subnetId = ''
        }
      })
    },
    getSubnet(vpcId) {
      getLogicalSwitch({ condition: JSON.stringify({ condition: 'listByVpcId', vpcId }) }).then((data) => {
        if (data.success) {
          this.subnetList = data.data
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 200px !important;
}
</style>
