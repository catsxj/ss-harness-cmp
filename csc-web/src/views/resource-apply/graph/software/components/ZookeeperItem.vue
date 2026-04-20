<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-alert v-if="itemData.cluster_install" class="m-b-sm" type="warning" :closable="false" title="注：支持集群（三节点）安装"></el-alert>
      <el-col :span="12">
        <basic-form-item label="部署方式：">
          <el-radio-group v-model="itemData.cluster_install" :disabled="isTaskInstance">
            <el-radio :label="false">单点</el-radio>
            <el-radio :label="true">集群</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select filterable v-model="itemData.version" placeholder="版本">
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
    itemData: {
      type: Object,
      default: function () {
        return {
          cluster_install: false
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
      getDictChildren({ value: 'ZOOKEEPER-VERSION' }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    }
  }
}
</script>
<style></style>
