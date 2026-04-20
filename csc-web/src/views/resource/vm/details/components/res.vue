<template>
  <div ref="res">
    <el-card class="m-t" :body-style="{ padding: 0 }">
      <basic-table border :data="list" :params="params" :get-list="getRes" :total="total">
        <el-table-column prop="content" label="操作内容" show-overflow-tooltip></el-table-column>
        <el-table-column prop="result" label="操作结果" show-overflow-tooltip></el-table-column>
        <el-table-column prop="operator" label="操作人" show-overflow-tooltip></el-table-column>
        <el-table-column prop="gmtOperate" label="操作时间" show-overflow-tooltip></el-table-column>
      </basic-table>
    </el-card>
  </div>
</template>

<script>
import { getRes } from 'services/platform/index'
import '../index.scss'

export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {},
  data() {
    return {
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  created() {
    this.getRes()
  },
  methods: {
    getRes(page) {
      this.params.page = page || this.params.page
      const params = {
        page: this.params.page,
        rows: this.params.rows
      }
      const searchParam = []
      searchParam.push({ param: { resourceId: this.detail.id, vendorId: this.detail.vendorId, target: 'VM' }, sign: 'EQ' })
      params.params = JSON.stringify(searchParam)
      getRes(params).then(data => {
        if (data.success) {
          if (data.data) {
            this.list = data.data.rows
            this.total = data.data.total
          }
        }
      })
    }
  }
}
</script>
<style lang="scss"></style>
