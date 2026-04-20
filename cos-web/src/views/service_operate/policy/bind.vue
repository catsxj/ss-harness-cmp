<template>
  <div>
    <el-dialog title="绑定集群" :visible.sync="addData.dialog" width="50%">
      <el-row>
        <el-transfer v-model="addData.data.clusterIds" :data="clusterData" :titles="['未选择', '已选择']"></el-transfer>
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
import { bindCluster, getCluters } from 'services/platform/index'
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
      clusterData: []
    }
  },
  methods: {
    ok() {
      bindCluster(this.addData.data).then((data) => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.addData.dialog = false
          this.$parent.$parent.getData()
        }
      })
    }
  },
  created() {
    getCluters({
      page: 1,
      rows: 9999,
      params: JSON.stringify([
        { param: { policyId: '' }, sign: 'NUL' },
        { param: { type: 'VMWARE' }, sign: 'EQ' }
      ])
    }).then((data) => {
      data.data.rows.forEach((item) => {
        const obj = {
          key: item.id,
          label: item.name + '(' + item.vendorName + ')'
        }
        this.clusterData.push(obj)
      })
    })
    getCluters({
      page: 1,
      rows: 9999,
      params: JSON.stringify([{ param: { policyId: this.addData.data.id, type: 'VMWARE' }, sign: 'EQ' }])
    }).then((data) => {
      data.data.rows.forEach((item) => {
        const obj = {
          key: item.id,
          label: item.name + '(' + item.vendorName + ')'
        }
        this.clusterData.push(obj)
        this.addData.data.clusterIds.push(item.id)
      })
    })
  }
}
</script>

<style></style>
