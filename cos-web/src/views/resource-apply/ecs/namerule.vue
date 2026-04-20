<template>
  <div>
    <!-- <el-col :span="12">
      <basic-form-item label="命名规则：">
        <el-select v-model="addData.nameruleId" placeholder="请选择命名规则" clearable filterable>
          <el-option v-for="(item, index) in nameruleList" :key="index" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </basic-form-item>
    </el-col> -->
    <el-col :span="12" key="name">
      <basic-form-item label="云主机名称：" label-width="107px">
        <el-input v-model="addData.name" placeholder="请输入云主机名" disabled></el-input>
        <!-- <div class="tip">设置云主机名称前缀</div> -->
      </basic-form-item>
    </el-col>
  </div>
</template>
<script>
import { getNameRule } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      nameruleList: []
    }
  },
  created() {
    getNameRule({
      page: 1,
      rows: 9999
    }).then((data) => {
      if (data.success) {
        this.nameruleList = data.data.rows
      }
    })
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
::v-deep .el-select,
::v-deep .el-input {
  width: 280px;
}
</style>
