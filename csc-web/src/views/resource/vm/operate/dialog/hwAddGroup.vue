<template>
  <div>
    <el-dialog title="加入安全组" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <basic-form-item label="安全组" prop="groups" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.data.groups" multiple>
              <el-option v-for="(item, index) in bindGroupList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
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
import { getVmGroup, vmJoinGroupAction } from 'services/platform/index'
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
      bindGroupList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          vmJoinGroupAction('batch', this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {
    getVmGroup(this.addData.data.id, { action: 'unbind', id: this.addData.data.id }).then(data => {
      if (data.success) {
        this.bindGroupList = data.data
      }
    })
  }
}
</script>

<style></style>
