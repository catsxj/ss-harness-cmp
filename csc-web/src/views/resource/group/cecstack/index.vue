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
          <!-- <div style="padding: 10px 0">
            <el-button type="ghost" @click="addRule(addRow)"> 添加规则 </el-button>
          </div> -->
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal" v-if="activeName === 'ingress'">
            <el-table-column prop="action" label="授权策略" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.action === 'Accept'">允许</span>
                <span v-if="scope.row.action === 'Drop'">拒绝</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="协议类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol | secruityProtocol }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="端口范围" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.portMin + '-' + scope.row.portMax }}
              </template>
            </el-table-column>
            <el-table-column prop="remoteIpPrefix" label="授权对象" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="priority" label="优先级" show-overflow-tooltip> </el-table-column>
            <!-- <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-delete" @click="ruleRemove(scope.row)">删除 </el-button>
              </template>
            </el-table-column> -->
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="出方向" name="egress">
          <el-alert title="提示" type="warning" show-icon description="安全组出方向默认允许所有访问，即从安全组内ECS访问外部都是放行的。"> </el-alert>
          <!-- <div style="padding: 10px 0">
            <el-button type="ghost" @click="addRule(addRow)"> 添加规则 </el-button>
          </div> -->
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal" v-if="activeName === 'egress'">
            <el-table-column prop="action" label="授权策略" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.action === 'Accept'">允许</span>
                <span v-if="scope.row.action === 'Drop'">拒绝</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="协议类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol | secruityProtocol }}
              </template>
            </el-table-column>
            <el-table-column prop="portMax" label="端口范围" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.portMin + '-' + scope.row.portMax }}
              </template>
            </el-table-column>
            <el-table-column prop="remoteIpPrefix" label="授权对象" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="priority" label="优先级" show-overflow-tooltip> </el-table-column>
            <!-- <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-delete" @click="ruleRemove(scope.row)">删除 </el-button>
              </template>
            </el-table-column> -->
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <el-dialog title="新增安全组" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag">
      <basic-form :model="addData" ref="addData" label-width="120px">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="所属地域：" prop="regionId" validate="required" required-message="请选择可用区">
              <el-select v-model="addData.regionId" filterable>
                <el-option v-for="item in regionList" :label="item.name" :value="item.regionId" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="安全组类型：" prop="securityGroupType" validate="required" required-message="请选择安全组类型">
              <el-select v-model="addData.securityGroupType">
                <el-option v-for="(item, index) in securityGroupTypeList" :label="item.name" :value="item.value" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required,aliName" required-message="请输入名称">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark">
              <el-input type="textarea" v-model="addData.remark" :maxlength="256"></el-input>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <basic-form-item label="资源组：" prop="resourceGroupUuid">
              <el-select v-model="addData.resourceGroupUuid" filterable clearable>
                <el-option v-for="(item, index) in rgroupList" :label="item.displayName" :value="item.resourceGroupUuid" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col> -->
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <!-- <el-button type="primary" @click="handleCreate()" slot="operate" icon="el-icon-plus">新增</el-button> -->
      </template>
      <template #groupUuid="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOperate({ flag: 2, row: record })" class="m-l-xs"> 编辑 </el-button>
        <el-button type="text" @click="handleOperate({ flag: 1, id: record.id })"> 删除 </el-button>
        <el-button type="text" @click="associate(record)" v-if="!record.instanceId">关联</el-button>
        <el-button type="text" @click="disassociation(record)" v-else>取消关联</el-button>
      </template>
    </AdvanceTable>
    <modify :add-data="modifyData" v-if="modifyData.dialog"></modify>
    <el-dialog title="添加规则" :visible.sync="ruleFlag" width="50%">
      <span>
        <security-rule ref="securityRule" :addData="ruleData" v-if="ruleFlag"></security-rule>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="ruleFlag = false">取 消</el-button>
        <el-button type="primary" @click="ruleOk">确 定</el-button>
      </span>
    </el-dialog>
    <asso v-if="assoData.dialog" :add-data="assoData" @goBack="getData"></asso>
  </div>
</template>

<script>
import modify from './dialog/modify.vue'
import securityRule from './dialog/rule.vue'
import { getRegion, getGroup, removeGroup, createGroup, detailGroup, getGroupRule, createGroupRule, removeGroupRule, patchGroups } from 'services/platform/index'
import asso from './dialog/asso.vue'

const securityGroupTypeList = [
  {
    name: '自定义',
    value: 'Custom'
  },
  {
    name: '放通 web 通用端口',
    value: 'WebServer'
  },
  {
    name: '出入方向全部放通',
    value: 'FullAccess'
  }
]
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
  }
  // {
  //   label: '资源组',
  //   prop: 'resourceGroupOriName'
  // },
  // {
  //   label: '操作',
  //   disabled: true,
  //   width: '220px',
  //   showOverflowTooltip: false,
  //   scopedSlots: { customRender: 'operate' }
  // }
]
export default {
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'vendorType', initValue: 'CECSTACK' }
      ]
    }
  },

  components: { modify, securityRule, asso },
  data() {
    return {
      columns,
      loading: false,
      submitLoading: false,
      params: {
        page: 1,
        rows: 10
      },
      addRow: {},
      activeName: 'ingress',
      securityGroupTypeList,
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
      addData: {},
      ruleData: {},
      rule: {
        name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      regionList: [],
      modifyData: {
        dialog: false,
        data: {}
      },

      assoData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    // 关联ip
    associate(row) {
      this.assoData = {
        dialog: true,
        groupUuid: row.groupUuid,
        regionId: row.regionId,
        vendorId: row.vendorId,
        data: {
          id: row.id,
          instanceId: '',
          securityGroupType: 'ECS'
        }
      }
    },
    // 取消关联ip
    disassociation(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '取消关联弹性ip地址',
        message: h('div', null, [h('p', null, '您确定要解绑该弹性公网IP绑定的资源吗？'), h('p', null, '弹性公网IP实例ID：'), h('ul', null, [h('li', null, `${row.groupUuid}`)]), h('p', null, '实例ID：'), h('ul', null, [h('li', null, `${row.instanceId}`)])]),
        showCancelButton: true,
        confirmButtonText: '取消关联',
        cancelButtonText: '取消'
      }).then(action => {
        if (action === 'confirm') {
          patchGroups(
            {
              action: 'disassociation'
            },
            row.id
          ).then(data => {
            const val = data.success ? 'success' : 'error'
            this.$message({
              type: val,
              message: data.message
            })
            this.getData()
          })
        }
      })
    },
    getRegion() {
      getRegion().then(data => {
        if (data.success) {
          this.regionList = data.data
        }
      })
    },

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
      console.log('vendorId: ', data.vendorId)
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
            groupId: this.installDetail.id
          },
          sign: 'EQ'
        }
      ])
      getGroupRule(this.paramd).then(data => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        regionId: this.searchData.regionId,
        resourceGroupUuid: this.searchData.resourceGroupUuid,
        'name:lk': this.searchData.name
      })
      this.getData()
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
        securityGroupType: 'Custom'
      }
      // this.getRegion()
      this.addFlag = true
    },
    addSubmit() {
      this.$refs.addData.validate(valid => {
        if (valid) {
          this.submitLoading = true
          createGroup(this.addData)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.handleSearch()
                this.addFlag = false
              }
            })
            .finally(() => {
              this.submitLoading = false
            })
        }
      })
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
                this.handleSearch()
              }
            })
          })
          break
        case 2:
          this.modifyData = {
            dialog: true,
            rgroupName: command.row.resourceGroupOriName,
            data: {
              id: command.row.id,
              name: command.row.name,
              remark: command.row.remark
            }
          }
          break
      }
    }
  }
}
</script>
