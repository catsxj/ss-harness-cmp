<template>
  <div>
    <el-dialog append-to-body title="移除安全组" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <basic-form ref="relieveGroupData" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="安全组" prop="groupId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.data.groupId">
              <el-option v-for="(item, index) in relieveGroupList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </basic-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { vmDeleteGroup, getVmGroup } from 'services/platform/index'
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
      relieveGroupList: []
    }
  },
  methods: {
    ok() {
      this.$refs.relieveGroupData.validate(valid => {
        if (valid) {
          vmDeleteGroup(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.handleSearch()
            }
          })
        }
      })
    }
  },
  created() {
    getVmGroup(this.addData.data.id, { action: 'listsgroup', id: this.addData.data.id }).then(data => {
      if (data.success) {
        this.relieveGroupList = data.data
      }
    })
  }
}
</script>

<style></style>
