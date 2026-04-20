<template>
  <el-card class="wrapper">
    <el-row>
      <el-col :span="2" :offset="22">
        <el-button type="ghost" @click="goBack">
          <Icon type="icon-fanhui"></Icon>
          返回
        </el-button>
      </el-col>
    </el-row>
    <div v-for="item in list" :key="item.name" class="m-b-md">
      <div class="detail-title">{{ item.name }}</div>
      <basic-table :data="item.value">
        <el-table-column label="序号" prop="number"></el-table-column>
        <el-table-column label="云主机名称" prop="name"></el-table-column>
        <el-table-column label="管理IP" prop="managerIp"></el-table-column>
        <el-table-column label="所属平台" prop="vendorName"></el-table-column>
        <el-table-column label="CPU配额(C)" prop="cpu"></el-table-column>
        <!--<el-table-column  label="CPU使用率" prop="gmtPaid"></el-table-column>-->
        <el-table-column label="内存配额(GB)" prop="memory"></el-table-column>
        <!--<el-table-column  label="内存使用率" prop="gmtPaid"></el-table-column>-->
        <el-table-column label="磁盘配额(GB)" prop="disk"></el-table-column>
        <!--<el-table-column  label="磁盘使用率" prop="gmtPaid"></el-table-column>-->
        <el-table-column label="所属用户" prop="ownerName"></el-table-column>
        <el-table-column label="租户名称" prop="tenantName"></el-table-column>
        <el-table-column :label="$store.getters.systemConfig.projectConfigLabel" prop="projectName"></el-table-column>
        <!-- <el-table-column label="CPU使用率（%）" prop="cpuUsage"></el-table-column>
        <el-table-column label="内存使用率（%）" prop="ramUsage"></el-table-column>
        <el-table-column label="磁盘使用率（%）" prop="diskUsage"></el-table-column> -->
        <!--<el-table-column  label="计费" prop="gmtPaid"></el-table-column>-->
        <!--<el-table-column  label="运行时间" prop="gmtPaid"></el-table-column>-->
        <div slot="pagination"></div>
      </basic-table>
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
