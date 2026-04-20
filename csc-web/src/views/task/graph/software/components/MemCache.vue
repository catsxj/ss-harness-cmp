<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row :gutter="20">
      <el-alert v-if="module === 'cluster'" class="m-b-sm" type="warning" :closable="false" title="注：支持集群（一主一备一代理）安装"></el-alert>
      <el-col :span="12">
        <basic-form-item label="软件版本：" prop="version" validate="required" key="version">
          <el-select v-model="itemData.version" placeholder="版本">
            <el-option v-for="(row, index) in versionData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12" v-if="module === 'cluster'">
        <basic-form-item label="Magent端口" prop="magent_config.magent_port" validate="required,port" show-overflow-tooltip>
          <el-input v-model="itemData.magent_config.magent_port" placeholder="Magent端口"></el-input>
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
          magent_config: {
            magent_port: 12000
          }
        }
      }
    },
    module: {
      type: String
    }
  },
  data() {
    return {
      versionData: []
    }
  },
  created() {
    this.getVersion()
    // 编辑数据处理
    if (!this.itemData.magent_config) {
      this.itemData.magent_config = {
        magent_port: 12000
      }
    }
  },
  methods: {
    getVersion() {
      getDictChildren({ value: 'MEMCACHE-VERSION' }).then(data => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    },
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          const { version, magent_config } = this.itemData
          data = { version }
          if (this.module === 'cluster') data = { version, magent_config }
        }
      })
      return data
    }
  }
}
</script>
<style></style>
