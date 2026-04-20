<template>
  <div>
    <el-dialog append-to-body title="配置安全组" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <basic-form-item label="安全组：" prop="groupId">
            <el-select v-model="addData.data.groupId" clearable>
              <el-option :key="index" v-for="(d, index) in sgroupData" :label="d.name" :value="d.id"></el-option>
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
import { getGroup } from 'services/platform/index'
import { patchNics } from 'services/platform/fc'

export default {
  props: {
    addData: {
      type: Object
    },
    vendorId: {
      type: Number
    }
  },
  data() {
    return {
      sgroupData: []
    }
  },
  methods: {
    // 获取安全组
    getSGroup() {
      getGroup({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          vendorId: this.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.sgroupData = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const data = this.addData.data
          let action = ''
          if (data.groupId) {
            action = 'addSgroup'
          } else {
            action = 'removeSgroup'
          }
          patchNics({
            action: action,
            ...data
          }).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.$emit('back')
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {
    this.getSGroup()
  }
}
</script>

<style></style>
