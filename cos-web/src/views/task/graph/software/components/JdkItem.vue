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
      <el-col :span="12">
        <basic-form-item label="安装jce：" prop="install_jce" validate="required">
          <el-select class="search-item" v-model="itemData.install_jce">
            <el-option v-for="item in yesData" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="JAVA_HOME：" prop="set_java_home" validate="required" show-overflow-tooltip>
          <el-select class="search-item" v-model="itemData.set_java_home">
            <el-option v-for="item in yesData" :key="item.value" :label="item.name" :value="item.value"> </el-option>
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
const yesData = [
  { name: '是', value: true },
  { name: '否', value: false }
]
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          version: '',
          install_jce: true,
          set_java_home: true
        }
      }
    }
  },
  data() {
    return {
      yesData,
      versionData: []
    }
  },
  created() {
    this.getVersion()
  },
  methods: {
    getVersion() {
      getDictChildren({ value: 'JAVA-VERSION' }).then((data) => {
        if (data.success) {
          this.versionData = data.data
        }
      })
    }
  }
}
</script>
<style></style>
