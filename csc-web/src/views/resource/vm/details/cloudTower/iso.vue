<template>
<div>
  <el-card class="m-t-xs" :body-style="{padding: 0}">
    <div slot="header"  class="clearfix">
      <span>ISO映像配置</span>
      <slot name="operate"></slot>
    </div>
    <basic-table border :data="list" :params="params" :get-list="getList" :total="total" style="margin:10px">
      <el-table-column prop="name" label="ISO映像名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="size" label="容量(GB)" show-overflow-tooltip></el-table-column>
      <el-table-column prop="filePath" label="路径" show-overflow-tooltip></el-table-column>
      <slot name="el-table-column"></slot>
    </basic-table>
  </el-card>
</div>

</template>

<script>
import { patchDisk, getVmImages } from 'services/platform/index'
import '../index.scss'

export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  watch: {
    detail() {
      this.getList()
    }
  },
  data () {
    return {
      list: [],
      total: 0,
      params: {
        action: 'attached',
        page: 1,
        rows: 10
      }
    };
  },
  created () {
    this.getList()
  },
  methods: {
    getList (page) {
      this.params.page = page || this.params.page
      const params = {
        action: 'attached',
        page: this.params.page,
        rows: this.params.rows
      }
      params.params = JSON.stringify([{
        param: { vendorId: this.detail.vendorId },
        sign: 'EQ'
      }])
      getVmImages(this.detail.id, params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    }
  }
};

</script>
<style lang="scss">
</style>
