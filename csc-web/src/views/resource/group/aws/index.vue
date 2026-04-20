<template>
  <div class="wrapper">
    <common-detail v-if="detailFlag" :title="installDetail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ installDetail.name }}</common-detail-item>
        <common-detail-item label="所属地域">{{ installDetail.regionName }}</common-detail-item>
        <common-detail-item label="描述">{{ installDetail.remark }}</common-detail-item>
      </template>
      <el-tabs v-model="activeName" @tab-click="changeTab">
        <el-tab-pane label="入方向" name="ingress">
          <div style="padding: 10px 0">
            <el-button type="ghost" @click="addRule(addRow)"> 添加规则 </el-button>
          </div>
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal" v-if="activeName === 'ingress'">
            <el-table-column prop="name" label="协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol | secruityProtocol }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="端口范围" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.portMin + '-' + scope.row.portMax }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="规则方向" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.direction | securityGroupFilter }}
              </template>
            </el-table-column>
            <el-table-column prop="props" label="IP版本" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="sourcePortRange" label="源IP范围" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-delete" @click="ruleRemove(scope.row)">删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="出方向" name="egress">
          <el-alert title="提示" type="warning" show-icon description="安全组出方向默认允许所有访问，即从安全组内ECS访问外部都是放行的。"> </el-alert>
          <div style="padding: 10px 0">
            <el-button type="ghost" @click="addRule(addRow)"> 添加规则 </el-button>
          </div>
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal" v-if="activeName === 'egress'">
            <el-table-column prop="name" label="协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol | secruityProtocol }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="端口范围" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.portMin + '-' + scope.row.portMax }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="规则方向" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.direction | securityGroupFilter }}
              </template>
            </el-table-column>
            <el-table-column prop="props" label="IP版本" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="remoteIpPrefix" label="远端IP范围" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-delete" @click="ruleRemove(scope.row)">删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" slot="operate">新增</el-button>
      </template>
      <template #groupUuid="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOperate({ flag: 2, row: record })"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <el-button type="text" @click="handleOperate({ flag: 1, id: record.id })"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
    <modify :add-data="modifyData" v-if="modifyData.dialog"></modify>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
    <el-dialog title="添加规则" :visible.sync="ruleFlag" width="50%">
      <span>
        <security-rule ref="securityRule" :addData="ruleData" v-if="ruleFlag"></security-rule>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="ruleFlag = false">取 消</el-button>
        <el-button type="primary" @click="ruleOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import modify from './dialog/modify.vue'
import securityRule from './dialog/rule.vue'
import add from './dialog/add.vue'
import { getVpc, getRegion, getGroup, removeGroup, modifyGroup, createGroup, detailGroup, getGroupRule, createGroupRule, removeGroupRule } from 'services/platform/index'
const columns = [
  {
    label: '组ID',
    prop: 'groupUuid',
    scopedSlots: { customRender: 'groupUuid' }
  },
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorType', initValue: 'AWS' }
      ]
    }
  },
  components: { modify, securityRule, add },
  data() {
    return {
      columns,
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      addRow: {},
      activeName: 'ingress',
      searchData: {
        name: '',
        regionId: '',
        resourceGroupUuid: ''
      },
      tableData: [],
      total: 0,
      ruleDetailData: [],
      rgroupList: [],
      paramd: {
        page: 1,
        rows: 10
      },
      ruleDetailTotal: 0,
      detailFlag: false,
      installDetail: {},
      // 新增数据
      addFlag: false,
      ruleFlag: false,
      addData: {
        dialig: false,
        data: {}
      },
      ruleData: {},
      rule: {
        name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      regionList: [],
      modifyData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    getData() {
      this.loading = true
      getGroup(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    changeTab() {
      this.getDetailHost()
    },
    ruleRemove(data) {
      this.$confirm('此操作将永久删除该规则, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeGroupRule(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getDetailHost(1)
          }
        })
      })
    },
    addRule(data) {
      this.ruleData = {
        direction: this.activeName,
        protocol: 'TCP',
        vendorId: data.vendorId,
        groupId: data.id,
        remoteIpPrefix: '0.0.0.0/0',
        sourcePortRange: '',
        portMin: '',
        portMax: '',
        props: 'IPV4',
        action: 'Accept',
        priority: 1
      }
      this.ruleFlag = true
    },
    ruleOk() {
      const data1 = this.$refs.securityRule.getPostData()
      if (!data1) return
      createGroupRule(data1).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.getDetailHost()
          this.ruleFlag = false
        }
      })
    },
    getDetailHost(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: {
            direction: this.activeName,
            groupId: this.installDetail.id,
            vendorId: this.installDetail.vendorId
          },
          sign: 'EQ'
        }
      ])
      getGroupRule(this.paramd).then(data => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
          this.ruleDetailData.forEach(data => {
            if (data.projectVisibility && data.projectVisibility != 'GLOBAL_PROJECT') {
              data.disabled = true
            }
          })
        }
      })
    },
    getDetail(row) {
      detailGroup(row.id).then(data => {
        if (data.success) {
          this.installDetail = data.data
          this.addRow = row
          this.getDetailHost()
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    handleCreate() {
      this.addData = {
        dialog: true,
        data: {}
      }
    },
    // 操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 1:
          // 删除
          this.$confirm('确定删除吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeGroup(command.id).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.getData()
              }
            })
          })
          break
        case 2:
          this.modifyData = {
            dialog: true,
            rgroupName: command.row.resourceGroupName,
            data: {
              id: command.row.id,
              name: command.row.name,
              remark: command.row.remark
            }
          }
          break
      }
    }
  },
  created() {}
}
</script>

<style scoped>
.no-searchBox {
  padding: 10px;
}

.diskDeviceItem {
  width: calc(100% - 80px);
}

.diskDeviceTitle {
  width: 50px;
  text-align: right;
  display: inline-block;
  vertical-align: middle;
}
</style>
