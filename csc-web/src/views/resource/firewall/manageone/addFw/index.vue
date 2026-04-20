<template>
  <div>
    <el-dialog title="新增防火墙" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="100px" :model="addData.data" ref="data">
        <vendor :add-data="addData.data" :types="['OPENSTACK', 'MANAGEONE']"></vendor>
        <manageone :add-data="addData.data" v-if="addData.data.vendorType == 'MANAGEONE' && addData.data.vendorId"></manageone>
        <op :add-data="addData.data" v-if="addData.data.vendorType == 'OPENSTACK' && addData.data.vendorId" :vendor-id="addData.data.vendorId"></op>
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
import vendor from '@/components/setVendor/index.vue'
import manageone from './manageone'
import op from './op.vue'
import { createFirewall } from 'services/platform/index'
export default {
  components: {
    vendor,
    manageone,
    op
  },
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
          createFirewall(this.addData.data).then(data => {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.addData.dialog = false
            this.$emit('back')
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
