<template>
  <div>
    <AdvanceTable ref="databaseTable" title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()">
          <i type="el-icon-plus"></i>
          新增
        </el-button>
        <!--<el-button type="ghost" @click="handleBatchDelete" :disabled="!selectList.length">-->
        <!--<i class="el-icon-delete" />-->
        <!--批量删除-->
        <!--</el-button>-->
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #monitoring="monitoring">
        <status-icon :type="monitoring ? 'success' : 'danger'">
          {{ monitoring ? '已开启' : '已关闭' }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)"><i class="el-icon-edit"></i>编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)"><i class="el-icon-delete"></i> 删除</el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!record.monitoring" @click.native="handleOpen(record.id)"> 开启监控 </el-dropdown-item>
            <el-dropdown-item v-else @click.native="handleClose(record.id)"> 关闭监控 </el-dropdown-item>
            <el-dropdown-item @click.native="alarmDetail(record)"> 告警详情 </el-dropdown-item>
            <el-dropdown-item @click.native="handleLink(record.id)"> 关联规则 </el-dropdown-item>
            <!-- <el-dropdown-item @click.native="handlePolicy(record)">
              {{`${record.alarmEnable ? '屏蔽':'开启'}告警`}}
            </el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag" width="60%">
      <basic-form :model="addData" ref="addData" label-width="110px">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="用户名：" prop="data.userName" validate="required">
              <el-input v-model="addData.data.userName" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="密码：" prop="data.password" validate="required">
              <el-input type="password" v-model="addData.data.password" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="地址：" prop="data.host" validate="required">
              <el-input v-model="addData.data.host" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="端口：" prop="data.port" validate="required,port">
              <el-input v-model="addData.data.port" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="DB：" prop="data.db" validate="required">
              <el-input v-model="addData.data.db" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addLinkFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
  </div>
</template>

<script>
import crypto from 'utils/crypto.js'
import { getOracles, createOracles, modifyOracles, batchRemoveResource, removeOracles, openOracles } from 'services/monitor/database'
import { getRuleGroupBind } from 'services/monitor'
import { handleStart } from 'views/data'
import addPolicy from 'views/components/linkPolicy.vue'
const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '地址',
    prop: 'data.host'
  },
  {
    label: '端口',
    prop: 'data.port'
  },
  {
    label: '监控',
    prop: 'monitoring',
    scopedSlots: { customRender: 'monitoring' }
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    addPolicy
  },
  data() {
    return {
      handleStart,
      columns,
      searchConfigs: [{ type: 'Input', label: '名称', value: 'name' }],
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      idList: [],
      selectList: [],
      // 新增编辑
      addFlag: false,
      addData: {},
      textMap: {
        update: '编辑资源监控',
        create: '创建资源监控'
      },
      dialogStatus: '',
      addLinkFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_RDS_ORACLE',
      loading: false
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    getList() {
      this.refreshId()
      this.loading = true
      getOracles(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            item.data = JSON.parse(item.data)
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.databaseTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    handleCreate(data) {
      if (data) {
        this.addData = Object.assign({}, data)
        this.dialogStatus = 'update'
        if (this.addData.data.password) {
          this.addData.data.password = crypto.decrypt(this.addData.data.password)
        }
        this.addFlag = true
      } else {
        this.addData = {
          data: {
            db: ''
          },
          type: 'MONITOR_RDS_ORACLE'
        }
        this.dialogStatus = 'create'
        this.addFlag = true
      }
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const str = JSON.stringify(this.addData)
          const addData = JSON.parse(str)
          if (addData.data.password) {
            addData.data.password = crypto.encrypt(addData.data.password)
          }
          if (this.dialogStatus === 'create') {
            createOracles(addData).then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.addFlag = false
              }
            })
          } else {
            modifyOracles(addData).then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.addFlag = false
              }
            })
          }
        }
      })
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该方案吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeOracles(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      this.refreshId()
      this.$confirm('您确定要批量删除选择方案吗?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          batchRemoveResource({
            ids: this.idList
          }).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.selectList = []
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    handleOpen(id) {
      this.$confirm('确定要开启监控吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          openOracles(id, 'open').then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    handleClose(id) {
      this.$confirm('确定要关闭监控吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          openOracles(id, 'close').then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    getDetail(row) {
      this.$router.push({ name: 'RdbmsOracleDetail', query: { id: row.id, name: row.name } })
    },
    alarmDetail(row) {
      this.$router.push({
        name: 'monitorDatabaseDetail',
        query: { id: row.id, name: row.name, type: row.type }
      })
    },
    handleLink(id) {
      this.ruleGroupIds = []
      this.resourceId = id
      getRuleGroupBind(id).then((data) => {
        if (data.success) {
          this.ruleGroupIds = data.data
          this.addLinkFlag = true
        }
      })
    },
    cancle() {
      this.addLinkFlag = false
      this.getList()
    },
    handlePolicy(data) {
      this.handleStart(this, data, this.resourceType)
    }
  }
}
</script>
<style scoped>
.search-item {
  width: 12%;
}
.rule-box {
  padding: 10px;
  padding-top: 0px;
  border: 1px solid #dcdfe6;
}
</style>
