<template>
  <div>
    <el-dialog title="选择服务" :visible.sync="dialog" width="70%">
      <el-row :gutter="20">
        <el-col :span="8" v-for="(item, index) in list" :key="index">
          <el-card class="card" shadow="hover">
            <h3>{{ item.name }}</h3>
            <div class="remark" :title="item.remark">{{ item.remark }}</div>
            <div class="m-t-md">
              <el-button @click="go(item)" class="pull-right" type="primary">立即申请</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getTenantServicesCode } from 'services/services/catelog'
import { formatEqParams } from 'utils/index'
export default {
  props: {
    dialog: {
      type: Boolean
    }
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    getTenantServicesCode({ code: 'compute' }).then(data => {
      if (data.success) {
        this.list = data.data
      }
    })
  },
  methods: {
    go(data) {
      this.$router.push({ name: data.code })
    }
  }
}
</script>

<style lang="scss" scoped>
.w {
  width: 100px !important;
}
.card {
  height: 150px;
  overflow: hidden;
}
.remark {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
