<template>
  <div>
    <el-dialog title="编辑子网" append-to-body :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <el-col :span="24">
            <basic-form-item label="子网名称" prop="name" validate="required,noChinese">
              <el-input v-model="addData.data.name" disabled></el-input>
            </basic-form-item>
            <basic-form-item label="安全组" prop="securityGroupId">
              <el-select v-model="addData.data.securityGroupId" clearable>
                <el-option v-for="(item, index) in groupList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { modifySubnet, getGroup } from 'services/platform/index'
/* global $ */
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
      groupList: []
    }
  },
  created() {
    this.getGroups()
  },
  methods: {
    getGroups() {
      getGroup({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.groupList = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          modifySubnet(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        }
      })
    }
  }
}
</script>

<style></style>
