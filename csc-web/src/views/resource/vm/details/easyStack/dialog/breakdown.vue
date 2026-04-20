<template>
  <div>
    <el-dialog title="故障详情" append-to-body :visible.sync="addData.dialog" width="70%" v-if="addData.dialog">
      <!-- <div class="log-container">
        <pre class="log-text" id="pre" ref="pre">{{addData.data}}</pre>
      </div> -->
      <el-form>
        <el-form-item label="消息">{{ this.addData.data.message }}</el-form-item>
        <el-form-item label="编码">{{ this.addData.data.code }}</el-form-item>
        <el-form-item label="时间">{{ time }}</el-form-item>
        <el-form-item label="详情">{{ this.addData.data.details }}</el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'utils/day'
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
      flag: false,
      time: ''
    }
  },
  methods: {
    getTime() {
      this.time = dayjs(this.addData.data.created).format('YYYY-MM-DD h:mm:ss a')
    }
  },
  created() {
    this.getTime()
  }
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
  padding: 30px;
}
::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}
.log-text {
  font-size: 15px;
  line-height: 20px;
  white-space: pre-line;
}
</style>
