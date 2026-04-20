<template>
  <div>
    <el-dialog title="新增安全组" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="120px" :model="addData.data" ref="data">
        <vendor :add-data="addData" vendorType="TCE"></vendor>
        <basic-form-item label="名称：" prop="name" validate="required,aliName" required-message="请输入名称">
          <el-input v-model="addData.data.name"></el-input>
        </basic-form-item>
        <basic-form-item label="描述：" prop="remark" validate="aliRemark">
          <el-input type="textarea" v-model="addData.data.remark" :maxlength="256"></el-input>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getRegion, createGroup, getVpc } from 'services/platform/index'
import vendor from '@/components/publicPool/index.vue'
export default {
  components: { vendor },
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
    return {}
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createGroup(this.addData.data).then(data => {
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
  },
  created() {}
}
</script>

<style></style>
