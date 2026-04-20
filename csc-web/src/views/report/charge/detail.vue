<template>
  <div class="wrapper-container">
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
          <el-table-column label="订单号" prop="sn"></el-table-column>
          <el-table-column label="产品名称" prop="resourceCategory"></el-table-column>
          <el-table-column label="订单类型" prop="category"></el-table-column>
          <el-table-column label="下单时间" prop="gmtCreate"></el-table-column>
          <el-table-column label="支付时间" prop="gmtPaid"></el-table-column>
          <el-table-column label="订单状态" prop="status"></el-table-column>
          <el-table-column :label="$store.getters.systemConfig.projectConfigLabel" prop="projectName"></el-table-column>
          <el-table-column label="申请人" prop="userName"></el-table-column>
          <el-table-column label="租户" prop="tenantName"></el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </div>
    </div>
  </div>
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
    //      switch (this.$route.params.reportCategory) {
    //        case 'Platform' :
    //          this.title = '平台综合报表历史';
    //          this.route = 'platformDetail';
    //          break;
    //        case 'CloudServer' :
    //          this.title = '云主机综合报表历史';
    //          break;
    //        case 'Server' :
    //          this.title = '物理机综合报表历史';
    //          break;
    //        case 'Storage' :
    //          this.title = '存储综合报表历史';
    //          break;
    //        case 'Charge' :
    //          this.title = '计量计费报表历史';
    //          break;
    //        case 'Monitor' :
    //          this.title = '监控报表历史';
    //          break;
    //        case 'Tenant' :
    //          this.title = '租户报表历史';
    //          break;
    //      }
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
