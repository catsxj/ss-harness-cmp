<template>
  <div>
    <el-dialog append-to-body title="升级VMware Tools" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form  :model="addData.data" ref="data">
          <basic-form-item label="">
            <el-radio :label="false" v-model="addData.data.type" style="position: reletive; top: -32px">&nbsp;</el-radio>
            <div style="display: inline-block">
              <div>交互式工具升级</div>
              <div>使用此选项更改已安装的VMware Tools组件</div>
            </div>
          </basic-form-item>
          <basic-form-item label="">
            <el-radio :label="true" v-model="addData.data.type" style="position: reletive; top: -64px">&nbsp;</el-radio>
            <div style="display: inline-block">
              <div>自动工具升级</div>
              <div>vCenter 将在不与客户机操作系统进行交互的情况下升级</div>
              <div>VMware Tools。必要时，云主机在升级后将自动重新引导</div>
            </div>
          </basic-form-item>
          <basic-form-item label="" maxlength="64">
            <div style="display: inline-block">高级选项：</div>
            <el-input v-model="addData.data.options" style="width: 80%" class="m-l-md" :disabled="!addData.data.type"></el-input>
            <div>
              <div>升级行为可以通过高级选项进行调整。有关如何使用这些选项的信息，请查询</div>
              <div>vCenter文档。</div>
            </div>
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
import { vmVmtools } from 'services/platform/index'
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
  data () {
    return {
    }
  },
  methods: {
    ok () {
      vmVmtools('upgradeToolsTask', {
        id: this.addData.data.id,
        options: this.addData.data.type ? this.addData.data.options : ''
      }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.addData.dialog = false;
          this.$parent.$parent.getData()
        }
      })
    }
  },
  created () {
  }
}
</script>

<style>

</style>
