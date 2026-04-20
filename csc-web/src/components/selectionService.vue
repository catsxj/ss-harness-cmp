<template>
  <el-dialog title="选择服务" :visible.sync="dialog.dialog" width="70%">
    <el-row :gutter="20">
      <el-col :span="8" v-for="(item, index) in list" :key="index" class="m-t-md">
        <el-card class="card" shadow="hover">
          <h3>{{ item.name }}</h3>
          <div class="remark" :title="item.remark">{{ item.remark }}</div>
          <div class="m-t-md m-b-md">
            <el-button @click="go(item)" class="pull-right" type="primary">立即订购</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getTenantServicesCode } from 'services/services/catelog'
import { formatEqParams } from 'utils/index'
export default {
  props: {
    dialog: {
      type: Object
    },
    code: {
      type: String
    },
    router: {
      type: String
    },
    obj: {
      type: Object
    }
  },
  data() {
    return {
      list: []
    }
  },
  created() {
    let obj = {
      code: this.code
    }
    if (this.obj) obj = Object.assign(obj, this.obj)
    getTenantServicesCode(obj).then(data => {
      if (data.success) {
        this.list = data.data
      }
    })
  },
  methods: {
    go(data) {
      this.$router.push({ name: this.router, params: { code: data.code, id: data.id } })
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
.service_card:hover {
  z-index: 2;
  -webkit-box-shadow: 0 7px 15px rgba(0, 0, 0, 0.1);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  -webkit-transform: translate3d(0, -1px, 0);
  transform: translate3d(0, -1px, 0);
}
</style>
