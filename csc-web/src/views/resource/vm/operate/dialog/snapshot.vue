<template>
  <div>
    <el-dialog title="新增快照" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <basic-form-item label="快照名称：" prop="name" validate="required">
            <el-input v-model="addData.data.name" auto-complete="off"></el-input>
          </basic-form-item>
          <el-form-item label="快照描述：" prop="remark">
            <el-input type="textarea" v-model="addData.data.remark" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { vmSnapshot, createSnapshot } from 'services/platform/index'
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
      regionList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          let obj = {}
          if (this.addData.data.type == 'disk') {
            obj = {
              id: this.addData.data.id,
              volumeId: this.addData.data.serverId,
              name: this.addData.data.name,
              remark: this.addData.data.remark
            }
            createSnapshot(obj).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
              }
            })
          } else {
            obj = {
              id: this.addData.data.id,
              serverId: this.addData.data.serverId,
              name: this.addData.data.name,
              remark: this.addData.data.remark
            }
            vmSnapshot(obj).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
              }
            })
          }
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
