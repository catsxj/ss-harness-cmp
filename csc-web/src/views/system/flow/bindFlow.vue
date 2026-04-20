<template>
  <div class="wrapper-container">
    <el-row :gutter="10">
      <el-col :span="24">
        <el-card>
          <el-row :gutter="20">
            <el-col v-for="(row, key) in serviceList" :key="row.id" class="m-b card-container">
              <el-card class="box-card service-card">
                <el-row style="padding-top: 10px">
                  <el-col :span="4" class="cell-logo" :style="{ color: colorMap[key % 7], 'border-color': colorMap[key % 7] }">{{ row.logo }} </el-col>
                  <el-col :span="20" class="cell-content">
                    <p class="cell-title">{{ row.name }}</p>
                    <el-tooltip :content="row.remark" placement="bottom-start">
                      <p class="cell-remark">{{ row.remark }}</p>
                    </el-tooltip>
                  </el-col>
                </el-row>
                <div class="footer">
                  <div class="pull-left footer-category">{{ row.tenantFlowName }}</div>
                  <el-button class="operate pull-right" type="ghost" @click="openDialog(row)">绑定</el-button>
                  <el-button v-if="row.tenantFlowId" class="operate pull-right m-r" type="ghost" @click="unBind(row)">解绑 </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <!--流程绑定-->
    <el-dialog title="流程绑定" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="600px">
      <basic-table :data="flowList" :params="params" :get-list="getFlow" :total="total">
        <el-table-column label="流程名称">
          <template slot-scope="scope">
            <el-radio v-model="bindData.flowId" :label="scope.row.baseLineId">{{ scope.row.name }}</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="创建人" show-overflow-tooltip prop="creatorName"> </el-table-column>
      </basic-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="bindFlow">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getFlow } from 'services/services/flow'
import { flowBindConfig, modifyFlowBindConfigNew } from 'services/services/catelog'
export default {
  data() {
    return {
      colorMap: ['#1890FF', '#F84540', '#18BE6A', '#696BD8', '#FE9900', '#01b3eb'],
      flowList: [],
      dialogVisible: false,
      serviceList: '',
      flowMap: {},
      params: {
        page: 1,
        rows: 5,
        params: JSON.stringify([{ param: { state: 'ACTIVE' }, sign: 'EQ' }])
      },
      total: 0,
      bindData: {
        id: '',
        flowId: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      flowBindConfig({
        params: JSON.stringify({
          tenantId: this.$store.getters.userData.tenantId || this.$store.getters.userData.id
        })
      }).then(data => {
        if (data.success) {
          this.serviceList = data.data
          this.serviceList.forEach(item => {
            this.$set(item, 'logo', item.name[0].toUpperCase())
          })
        }
      })
    },
    getFlow() {
      getFlow(this.params).then(data => {
        if (data.success) {
          this.flowList = data.data.rows
          this.total = data.data.total
        }
      })
    },
    openDialog(row) {
      this.bindData = {
        id: row.id,
        tenantId: this.$store.getters.userData.tenantId || this.$store.getters.userData.id,
        flowId: row.tenantFlowId
      }
      this.params.page = 1
      this.total = 0
      this.getFlow()
      this.dialogVisible = true
    },
    unBind(row) {
      this.$confirm('您确定要解绑该流程吗?', '提示', {
        confirmButtonText: '解绑',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        this.bindData = {
          id: row.id,
          tenantId: this.$store.getters.userData.tenantId || this.$store.getters.userData.id,
          flowId: ''
        }
        this.bindFlow()
      })
    },
    bindFlow() {
      const formData = new FormData()
      formData.append('params', JSON.stringify(this.bindData))
      modifyFlowBindConfigNew(this.bindData.id, formData).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.dialogVisible = false
          this.getList()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.service-card {
  position: relative;
  padding-bottom: 52px;
  .cell-logo {
    height: 60px;
    width: 60px;
    text-align: center;
    line-height: 60px;
    border-radius: 30px;
    font-size: 20px;
    font-weight: bold;
    border: 1px solid #f90;
    color: #f90;
  }
  .cell-content {
    width: calc(100% - 64px);
    padding: 0 15px 15px;
    & > p {
      margin: 0 0 10px 0;
    }
    .cell-title {
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cell-remark {
      display: -webkit-box;
      height: 32px;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: #999;
      font-size: 12px;
    }
    .cell-status {
      position: absolute;
      top: -12px;
      right: 0px;
      font-size: 12px;
      & > .color {
        color: #18be6a;
      }
    }
  }
  .footer {
    position: absolute;
    width: calc(100% - 40px);
    left: 0;
    bottom: 0;
    padding: 5px 20px;
    border-top: 1px solid #ebebeb;
    .footer-operate {
      width: 160px;
    }
    .footer-category {
      height: 32px;
      line-height: 32px;
      color: #666;
      font-size: 12px;
      width: calc(100% - 180px);
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .operate:not(.is-disabled) {
      color: #666;
      &:hover {
        color: #2d8cf0;
      }
    }
    i.iconfont {
      font-size: 16px;
    }
  }
}

@media screen and (max-width: 1280px) {
  .card-container {
    width: 50% !important;
  }
}

@media screen and (min-width: 1280px) and (max-width: 1680px) {
  .card-container {
    width: 33.3333% !important;
  }
}

@media screen and (min-width: 1680px) and (max-width: 1920px) {
  .card-container {
    width: 25% !important;
  }
}

body #app .service-menu .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
  background-color: #e7f4ff !important;
  color: #2d8cf0 !important;
  .tree-operate {
    float: right;
    display: inline-block;
  }
}

.custom-tree-node {
  display: inline-block;
  width: 100%;
}

.tree-operate {
  display: none;
  float: right;
  .iconfont {
    cursor: pointer;
    margin-right: 5px;
  }
}
</style>
