<template>
  <div>
    <el-dialog title="分配资源池" :visible.sync="addData.dialog" width="700px">
      <el-row>
        <el-transfer filterable v-model="addData.data.poolIds" :data="list" :titles="['未选择', '已选择']">
          <span slot-scope="{ option }" :title="option.label">{{ option.label }}</span>
        </el-transfer>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getPoolConditions } from 'services/platform/pool'
import { getTenantPool, assignTenantPools } from 'services/system/tenant'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false,
          loading: false
        }
      }
    }
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    ok() {
      this.loading = true
      assignTenantPools(this.addData.data).then((data) => {
        if (data.success) {
          this.loading = false
          this.$message({
            type: 'success',
            message: data.message
          })
          this.addData.dialog = false
          this.$emit('back')
        }
      })
    }
  },
  created() {
    getPoolConditions({
      page: 1,
      rows: 9999,
      condition: JSON.stringify({ condition: 'listAssignGroups', tenantId: this.addData.data.id })
    }).then((data) => {
      data.data.forEach((item) => {
        const obj = {
          key: item.id,
          label: item.name
        }
        this.list.push(obj)
      })
    })
    getTenantPool(this.addData.data.id).then((data) => {
      this.$set(this.addData.data, 'poolIds', [])
      data.data.forEach((item) => {
        const obj = {
          key: item.poolGroupId,
          label: item.name
        }
        this.addData.data.poolIds.push(item.poolGroupId)
      })
    })
  }
}
</script>

<style></style>
