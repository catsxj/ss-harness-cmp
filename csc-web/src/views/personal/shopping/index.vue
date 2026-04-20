<template>
  <el-card class="wrapper">
    <div class="search-content m-b">
      <el-button type="primary" @click="ok">确认申请</el-button>
      <el-button type="danger" @click="clearAll">清空购物车</el-button>
    </div>
    <basic-table :data="list" @selection-change="leftSelectionChange">
      <el-table-column label="服务名称" prop="serviceName" show-overflow-tooltip> </el-table-column>
      <!-- <el-table-column label="服务类型" prop="resourceCategory" show-overflow-tooltip>
        <template slot-scope="scope">
          {{scope.row.resourceCategory | serviceCategoryFilter}}
        </template>
      </el-table-column>
      <el-table-column label="资源名称" prop="name" show-overflow-tooltip>
      </el-table-column> -->
      <el-table-column label="申请数量" prop="count" show-overflow-tooltip> </el-table-column>
      <el-table-column label="申请时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
      <!-- <el-table-column label="使用时长(月)" prop="months" show-overflow-tooltip>
      </el-table-column> -->
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="text" icon="el-icon-edit" @click="modify(scope.row)">编辑</el-button>
          <el-button size="small" type="text" icon="el-icon-delete" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </el-card>
</template>
<script>
import { getShoppingCart, removeShoppingCart, emptyShoppingCart, shoppingOkCloudServices } from 'services/system/shop_cart'
export default {
  data() {
    return {
      dialogVisible: false,
      list: [],
      params: {
        page: 1,
        rows: 10000
      },
      router: {
        Storage: 'ServiceDiskCreate',
        Vpc: 'ServiceVpcCreate',
        LoadBalance: 'ServiceLbCreate',
        FloatingIp: 'ServiceFloatIpCreate',
        Computer: 'ServiceEcsCreate',
        MySQL: 'ServiceMySqlCreate',
        Redis: 'ServiceRedisCreate',
        MongoDB: 'ServiceMongodbCreate',
        pg: 'ServicePgCreate',
        Kafka: 'ServiceKafkaCreate',
        RabbitMQ: 'ServiceRabbitMqCreate'
      },
      leftSlection: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    leftSelectionChange(selection) {
      this.leftSlection = selection
    },
    getList() {
      getShoppingCart(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    },
    ok() {
      if (this.list.length === 0) {
        this.$message.error('购物车内暂无任何资源申请单')
        return
      }
      this.$confirm('请确认是否提交申请?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        shoppingOkCloudServices().then(data => {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.getList()
        })
      })
    },
    clearAll() {
      this.$confirm('请确认是否清空购物车?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        emptyShoppingCart({}).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    remove(id) {
      this.$confirm('请确认是否移除该申请?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeShoppingCart(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    modify(data) {
      const inventory = JSON.parse(data.inventory)
      const params = {}
      if (['Kafka', 'MySQL', 'pg'].includes(data.resourceCategory)) {
        params.code = inventory.service
      } else if (['Storage', 'Vpc', 'LoadBalance', 'FloatingIp', 'Computer'].includes(data.resourceCategory)) {
        params.type = inventory.location.vendorType
      }
      // 软件安装兼容处理
      function getSoftwareRoute() {
        if (inventory.service.includes('operations')) return 'ServiceOpsCreateTplPreview'
        return 'ServiceRosCreateTplPreview'
      }
      this.$router.push({
        name: this.router[data.resourceCategory] || getSoftwareRoute(),
        params,
        query: {
          id: data.id
        }
      })
    }
  },
  filters: {
    serviceCategoryFilter(status) {
      const statusMap = {
        ResourceComputerApply: '云主机申请',
        ResourceImageApply: '镜像申请',
        ResourceStorageApply: '云硬盘申请',
        ResourceRouterApply: '云路由申请',
        ResourceFloatingIpApply: '公网IP申请',
        ResourceSnapshotApply: '云快照申请',
        F5ExpansionApply: 'F5扩容',
        ResourceF5Apply: 'F5申请'
      }
      return statusMap[status]
    }
  }
}
</script>
