<template>
  <div>
    <el-dialog :title="addData.title" append-to-body :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="子网名称" prop="name" validate="required,noChinese">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
          <basic-form-item label="CIDR：" prop="sonCidr" validate="required">
            <el-input v-model="addData.data.sonCidr"></el-input>
          </basic-form-item>
          <basic-form-item label="安全组" prop="securityGroupId">
            <el-select v-model="addData.data.securityGroupId">
              <el-option v-for="(item, index) in groupList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
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
import { createSubnet, modifySubnet, getGroup } from 'services/platform/index'
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
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createSubnet(this.addData.data).then(data => {
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
    },
    getGroups() {
      getGroup({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.groupList = data.data.rows
        }
      })
    }
  }
}
</script>

<style></style>
