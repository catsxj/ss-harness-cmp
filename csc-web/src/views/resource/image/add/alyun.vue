<template>
  <div>
    <basic-form-item label="云主机：" prop="serverId" validate="required" required-message="请选择云主机">
      <el-select v-model="addData.serverId" filterable>
        <el-option v-for="(item, index) in vmList" :key="index" :label="`${item.name}(${item.instanceId})`" :value="item.id"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <el-form-item label="描述：" prop="remark" validate="aliRemark">
      <el-input type="textarea" v-model="addData.remark"></el-input>
    </el-form-item>
  </div>
</template>

<script>
import { getVm } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          name: ''
        }
      }
    },
    vendorId: {
      type: [String, Number]
    },
    title: {
      type: String
    },
    regionId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      regionData: [],
      vmList: []
    }
  },
  watch: {
    regionId() {
      this.getVm()
    }
  },
  methods: {
    getVm() {
      this.$set(this.addData, 'serverId', '')
      getVm({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.vendorId, regionId: this.addData.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.vmList = data.data.rows
        }
      })
    }
  },
  created() {
    this.addData.isNoRestart = true
    this.getVm()
  }
}
</script>

<style scoped></style>
