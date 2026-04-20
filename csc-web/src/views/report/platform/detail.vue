<template>
  <el-card class="wrapper-container">
    <div>
      <el-row>
        <el-col :span="2" :offset="22">
          <el-button type="ghost" @click="goBack">
            <Icon type="icon-fanhui"></Icon>
            返回
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div>
      <div v-for="item in list" :key="item.name" class="m-b-md">
        <div class="detail-title">{{ item.name }}</div>
        <basic-table :data="item.value">
          <el-table-column label="序号" prop="number"></el-table-column>
          <el-table-column label="平台名称" prop="cloudVendorName"></el-table-column>
          <!--<el-table-column  label="平台数量" prop="gmtCreate"></el-table-column>-->
          <el-table-column label="新增宿主机数量" prop="serverCount"></el-table-column>
          <el-table-column label="新增云主机数量" prop="cloudServerCount"></el-table-column>
          <el-table-column label="新增平台告警" prop="platAlarmCount"></el-table-column>
          <el-table-column label="新增资源告警" prop="resourceAlarmCount"></el-table-column>
          <!-- <el-table-column label="租户数量" prop="tenantCount"></el-table-column> -->
          <el-table-column label="宿主机数" prop="serverNumber"></el-table-column>
          <el-table-column label="云主机数" prop="cloudServerNumber"></el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </div>
    </div>
  </el-card>
</template>
<script>
import { remoportDetailList } from 'services/report/index'

export default {
  data() {
    return {
      list: null,
      total: null,
      title: '',
      route: '',
      listQuery: {
        time: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      id: this.$route.params.id
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      remoportDetailList({ id: this.id }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    goBack() {
      this.$router.back(-1)
    }
  }
}
</script>
