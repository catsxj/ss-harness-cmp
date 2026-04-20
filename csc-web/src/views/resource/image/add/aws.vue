<template>
  <div>
    <basic-form-item label="云主机：" prop="id" validate="required" required-message="请输入名称">
      <el-select v-model="addData.id" filterable>
        <el-option v-for="(item, index) in vmList" :key="index" :label="`${item.name}(${item.instanceId})`" :value="item.id"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="不重启：" prop="isNoRestart">
      <el-checkbox v-model="addData.isNoRestart" style="margin-right: 4px"></el-checkbox>
      <el-tooltip class="item" effect="dark" content="启用后，Amazon EC2 不会在创建映像前关闭实例。如果使用此选项，则无法保证所创建映像上的文件系统的完整性。" placement="top">
        <el-button type="text" icon="el-icon-question"></el-button>
      </el-tooltip>
    </basic-form-item>
    <basic-form-item label="名称：" prop="name" validate="required">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <basic-form-item label="AMI名称：" prop="props" validate="required,awsAmi" maxlength="128" required-message="请输入AMI名称称">
      <el-input v-model="addData.props"></el-input>
    </basic-form-item>
    <el-form-item label="描述：" prop="remark" validate="required">
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
      this.$set(this.addData, 'id', '')
      this.vmList = []
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
    this.getVm()
  }
}
</script>

<style scoped></style>
