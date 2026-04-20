<template>
  <div>
    <el-dialog title="查看YAML" :visible.sync="addData.dialog" width="70%" v-if="addData.dialog">
      <div class="log-container">
        <pre class="log-text" id="pre" ref="pre" contenteditable="true">{{ addData.data.yamlText }}</pre>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">更 新</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { vmJoinGroup, getVmGroup } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      flag: false
    }
  },
  methods: {
    ok() {
      const obj = {
        yamlText: document.getElementById('pre').innerHTML,
        id: this.addData.data.id
      }
      this.$emit('modify', obj)
    }
  },
  created() {}
}
</script>

<style scoped>
.log-container {
  background: rgba(0, 0, 0, 0.7);
  height: 400px;
  overflow: hidden;
  overflow-y: auto;
  z-index: 4;
  color: #e5e5e5;
  padding: 5px;
}
::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}
.log-text {
  font-size: 15px;
  line-height: 20px;
}
</style>
