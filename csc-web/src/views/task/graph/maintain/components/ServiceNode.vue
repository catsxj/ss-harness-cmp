<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="操作系统：">
          <el-radio-group v-model="itemData.osCategory" @change="selectCategory" :disabled="isTaskInstance">
            <el-radio label="Windows">Windows</el-radio>
            <el-radio label="Linux">Linux</el-radio>
          </el-radio-group>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="服务名：" prop="name" validate="required" required-message="请输入服务名">
          <el-input v-model="itemData.name" auto-complete="off"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="操作：" prop="state">
          <el-select clearable v-model="itemData.state" placeholder="请选择操作">
            <el-option v-for="(item, index) in operateData" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="参数：" prop="arguments">
          <el-input v-model="itemData.arguments" auto-complete="off"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item v-if="itemData.osCategory === 'Linux'" label=" 开机自启动：">
          <el-select clearable v-model="itemData.enabled" placeholder="请选择">
            <el-option v-for="(item, index) in enabledData" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-else label="启动参数：">
          <el-select clearable v-model="itemData.start_mode" placeholder="请选择">
            <el-option v-for="(item, index) in enabledData" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
const operateLinux = [
  { name: '启动', value: 'started' },
  { name: '停止', value: 'stopped' },
  { name: '重新启动', value: 'restarted' },
  { name: '重新加载', value: 'reloaded' }
]
const operateWindow = [
  { name: '启动', value: 'started' },
  { name: '停止', value: 'stopped' },
  { name: '重新启动', value: 'restarted' },
  { name: ' 删除', value: 'absent' },
  { name: ' 暂停', value: 'paused' }
]
const enabledLinux = [
  { name: '设置开机启动', value: true },
  { name: '取消开机启动', value: false }
]
const enabledWindow = [
  { name: '自动（延迟启动）', value: 'delayed' },
  { name: '自动', value: 'auto' },
  { name: '手动', value: 'manual' },
  { name: '禁用', value: 'disabled' }
]

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          osCategory: 'Linux',
          name: '',
          arguments: '',
          state: '',
          enabled: '',
          start_mode: ''
        }
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    operateData() {
      return this.itemData.osCategory === 'Linux' ? operateLinux : operateWindow
    },
    enabledData() {
      return this.itemData.osCategory === 'Linux' ? enabledLinux : enabledWindow
    }
  },
  created() {},
  methods: {
    selectCategory() {
      this.itemData.state = ''
      this.itemData.enabled = ''
      this.itemData.start_mode = ''
    },
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          const { state, enabled, start_mode: startMode, osCategory } = this.itemData
          if (!state && ((!enabled && osCategory === 'Linux') || (!startMode && osCategory === 'Windows'))) {
            this.$message({
              message: '操作和启动类型必须至少选择一项',
              type: 'error'
            })
            return
          }
          if (osCategory === 'Linux') this.itemData.start_mode = ''
          else this.itemData.enabled = ''
          data = this.itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
