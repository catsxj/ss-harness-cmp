<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-alert class="m-b-sm" type="warning" :closable="false" title="注：支持集群（两主两从一服务）安装"></el-alert>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select filterable v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="集群名称：" prop="cluster_name" validate="required" :rule="clusterNameRule">
          <el-input v-model="itemData.cluster_name" placeholder="集群名称"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="是否安装Exporter：" show-overflow-tooltip>
          <el-radio-group v-model="itemData.install_rocketmq_exporter">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
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
          version: '',
          cluster_name: '',
          install_rocketmq_exporter: true
        }
      }
    }
  },
  data() {
    return {
      versionData: [],
      clusterNameRule: [{ pattern: /^[a-zA-Z](?!.*?-$)[a-zA-Z0-9-]*$/, message: '支持数字，字母，中划线，以字母开头' }]
    }
  },
  created() {
    this.getVersion()
  },
  methods: {
    getVersion() {
      getDictChildren({ value: 'ROCKETMQ-VERSION' }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    }
  }
}
</script>
<style></style>
