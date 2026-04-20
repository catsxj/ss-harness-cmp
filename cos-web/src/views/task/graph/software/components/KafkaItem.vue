<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row :gutter="15">
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="scala版本：" prop="manage_config.kafka_scala_version" validate="required">
          <el-select v-model="itemData.manage_config.kafka_scala_version" placeholder="版本">
            <el-option v-for="(row, index) in scalaVersionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="是否安装Exporter：" show-overflow-tooltip>
          <el-radio-group v-model="itemData.install_jmx_exporter">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <basic-form-item label="ZK路径：" prop="manage_config.kafka_zookeeper_connection_string" validate="required" :rule="rule">
          <el-input type="textarea" v-model="itemData.manage_config.kafka_zookeeper_connection_string" placeholder="192.168.1.1:2181,192.168.1.2:2181"></el-input>
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
          install_jmx_exporter: true,
          manage_config: {
            kafka_scala_version: '',
            kafka_zookeeper_connection_string: ''
          }
        }
      }
    }
  },
  data() {
    return {
      versionData: [],
      scalaVersionData: [],
      rule: [
        {
          pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]):([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]),?)*$/,
          message: '请按照提示输入正确的格式'
        }
      ]
    }
  },
  created() {
    this.getVersion('KAFKA-VERSION')
    this.getVersion('SCALA-VERSION')
  },
  methods: {
    getVersion(value) {
      getDictChildren({ value: value }).then((data) => {
        if (data.success) {
          if (value === 'KAFKA-VERSION') {
            this.versionData = data.data
          } else {
            this.scalaVersionData = data.data
          }
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
@import 'index';
</style>
