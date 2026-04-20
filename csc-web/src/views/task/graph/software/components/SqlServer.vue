<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import { getDictChildren } from 'services/system/dictionary'

export default {
  mixins: [node, show],
  props: {
    module: {
      type: String
    },
    itemData: {
      type: Object,
      default: function () {
        return {
          version: ''
        }
      }
    }
  },
  data() {
    return {
      versionData: []
    }
  },
  created() {
    this.getVersion()
  },
  methods: {
    getVersion() {
      getDictChildren({ value: 'SQLSERVER-VERSION' }).then(data => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
