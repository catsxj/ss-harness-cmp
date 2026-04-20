<template>
  <div>
    <el-dialog :title="titleName" :visible.sync="addFlag" v-if="addFlag" width="50%" :before-close="handleClose" :close-on-click-modal="false">
      <security-item ref="securityItem" :addData="addData"></security-item>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFlag = false">取 消</el-button>
        <el-button type="primary" @click="dialogOk(1, 'addData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="添加规则" :visible.sync="ruleFlag" width="50%">
      <span>
        <security-rule ref="securityRule" :addData="ruleData" v-if="ruleFlag"></security-rule>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="ruleFlag = false">取 消</el-button>
        <el-button type="primary" @click="dialogOk(2, 'ruleData')">确 定</el-button>
      </span>
    </el-dialog>
    <div class="wrapper" v-if="!detailFlag">
      <AdvanceTable title="安全组列表" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
        <template v-slot:action>
          <el-button type="primary" @click="handleCreate()"> 新增 </el-button>
          <el-button type="ghost" :disabled="selectList.length == 0" @click="handleDelete()" icon="el-icon-delete"> 批量删除 </el-button>
        </template>
        <template #name="val, record">
          <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
        </template>
        <template #operate="val, record">
          <el-button :disabled="record.disabled" type="text" @click="dropdownClick({ id: record.id, index: 1 })"> <i class="el-icon-edit"></i> 编辑 </el-button>
          <div class="action-divider"></div>
          <el-button :disabled="record.disabled" type="text" @click="dropdownClick({ id: record.id, index: 2 })"> <i class="el-icon-delete"></i> 删除 </el-button>
          <div class="action-divider"></div>
          <el-button :disabled="record.disabled" type="text" @click="dropdownClick({ row: record, index: 3 })">添加规则 </el-button>
        </template>
      </AdvanceTable>
    </div>
    <common-detail v-if="detailFlag" :setting="{ type: 'safe_group' }" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="所属平台">{{ detail.vendorName }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detail.tenantName }}</common-detail-item>
        <common-detail-item label="描述">{{ detail.remark }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="规则列表" name="second">
          <el-button class="m-b" type="primary" @click="dropdownClick({ row: detail, index: 3 })">添加 </el-button>
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal" ref="ruleMultipleTable" @select="ruleHandleSelectItem" @select-all="ruleHandleSelectAll">
            <el-table-column prop="protocol" label="IP协议" show-overflow-tooltip></el-table-column>
            <el-table-column prop="direction" label="方向" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ directionFilter(scope.row.direction) }}
              </template>
            </el-table-column>
            <el-table-column prop="ipRanges" label="IP地址" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.ipRanges }}
              </template>
            </el-table-column>
            <el-table-column prop="portMin" label="起始端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="portMax" label="结束端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="icmp" label="ICMP" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.icmp }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-delete" @click="ruleRemove(scope.row.id)" :disabled="scope.row.disabled">删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>

<script>
import securityItem from '../../components/securityItem.vue'
import securityRule from '../../components/securityRule.vue'
import { removeGroups, getGroup, removeGroup, modifyGroup, createGroup, detailGroup } from 'services/platform/index'
import { getVdc, getGroupRule, createGroupRule, removeGroupRule, detailGroupRule } from 'services/platform/fc'
const columns = [
  {
    type: 'selection'
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '安全组ID',
    prop: 'groupUuid'
  },
  {
    label: '规则数量',
    prop: 'ruleNum'
  },
  {
    label: '云主机数量',
    prop: 'vmNum'
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    width: '300px',
    scopedSlots: { customRender: 'operate' },
    disabled: true
  }
]
export default {
  components: {
    securityItem,
    securityRule
  },
  props: {},
  data() {
    const validateMin = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入起始端口'))
      } else {
        if (this.ruleData.portMin !== '') {
          this.$refs.ruleData.validateField('portMin')
        }
        callback()
      }
    }
    const validateMax = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入结束端口'))
      } else if (value < this.ruleData.portMin) {
        callback(new Error('结束端口小于其实端口'))
      } else {
        callback()
      }
    }
    return {
      columns,
      loading: false,
      ruleDetailData: [],
      ruleDetailTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      detail: '',
      detailFlag: false,
      validateMin: [{ validator: validateMin }],
      validateMax: [{ validator: validateMax }],
      params: {
        page: 1,
        rows: 10
      },
      tableData: [],
      total: 0,
      titleName: '新增安全组',
      addFlag: false,
      addData: {},
      ruleData: {
        portMin: '',
        portMax: '',
        direction: '0',
        protocol: 'TCP'
      },
      ruleFlag: false,
      id: '',
      idList: [],
      selectList: [],
      ruleIdList: [],
      ruleSelectList: []
    }
  },
  computed: {
    searchConfigs() {
      return [
        { type: 'Input', label: '名称', value: 'name' },
        // { type: 'Const', value: 'vendorId', initValue: this.platformObject.vendorId }
        { type: 'Const', value: 'vendorType', initValue: 'FUSIONSPHERE' }
      ]
    }
  },
  methods: {
    directionFilter(value) {
      const obj = {
        0: '入方向',
        1: '出方向'
      }
      return obj[value]
    },
    ruleRefreshId() {
      this.ruleIdList = []
      this.ruleSelectList.forEach(item => {
        this.ruleIdList.push(item.id)
      })
    },
    // 单选
    ruleHandleSelectItem(selection, row) {
      this.ruleRefreshId()
      if (this.ruleIdList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.ruleSelectList.length; j++) {
          const item = this.ruleSelectList[j]
          if (item.id == row.id) {
            this.ruleSelectList.splice(j, 1)
            break
          }
        }
      } else {
        this.ruleSelectList.push(row)
      }
    },
    // 全选
    ruleHandleSelectAll(selection) {
      this.ruleRefreshId()
      if (selection.length) {
        // 全选情况下
        this.ruleDetailData.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.ruleSelectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.ruleDetailData.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.ruleSelectList.length; j++) {
              const row = this.ruleSelectList[j]
              if (item.id == row.id) {
                this.ruleSelectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    // 单选
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
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.tableData.forEach(item => {
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
    // 删除规则
    ruleRemove(id) {
      this.$confirm('此操作将永久删除该规则, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeGroupRule(id).then(data => {
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
    // 详情
    getDetail(id) {
      this.id = id
      detailGroup(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detailFlag = true
          this.getDetailHost(1)
        }
      })
    },
    goBack() {
      this.ruleSelectList = []
      this.getData()
      this.detailFlag = false
    },
    getDetailHost(page) {
      this.ruleRefreshId()
      this.paramd.page = page || this.paramd.page
      this.paramd.params = this.$tools.handleSearchParam({
        groupId: this.id,
        // vendorId: this.platformObject.vendorId
        vendorId: this.detail.vendorId
      })
      getGroupRule(this.paramd).then(data => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
          this.ruleDetailData.forEach(data => {
            if (data.projectVisibility && data.projectVisibility != 'GLOBAL_PROJECT') {
              data.disabled = true
            }
            const self = this
            setTimeout(function () {
              if (self.ruleIdList.indexOf(data.id) > -1) self.$refs.ruleMultipleTable.$refs.basicTable.toggleRowSelection(data, true)
            })
          })
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
          this.selectList = []
          this.refreshId()
          this.tableData.forEach(data => {
            if (data.projectVisibility && data.projectVisibility != 'GLOBAL_PROJECT') {
              data.disabled = true
            }
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(data.id) > -1) self.$refs.multipleTable.$refs.basicTable.toggleRowSelection(data, true)
            })
          })
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params || this.params.params
      this.getData()
    },
    handleDelete() {
      this.refreshId()
      const list = this.idList
      this.$confirm('此操作将删除所选安全组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeGroups(list).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
            this.selectList = []
          }
        })
      })
    },
    // 删除
    remove(id) {
      this.$confirm('此操作将永久删除该安全组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeGroup(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    // 下拉框点击事件
    dropdownClick(command) {
      switch (command.index) {
        case 1:
          this.dialog('addFlag', 1, command.id)
          break
        case 2:
          this.remove(command.id)
          break
        case 3:
          this.dialog('ruleFlag', 2, command.row)
          break
      }
    },
    handleCreate() {
      this.titleName = '新增安全组'
      this.addData = {}
      this.addFlag = true
    },
    // 模态框开启前执行事件
    dialog(flag, index, item) {
      this[flag] = true
      switch (index) {
        case 1:
          if (item) {
            this.titleName = '编辑安全组'
            detailGroup(item).then(data => {
              if (data.success) {
                const { id, name, remark, vendorId } = data.data
                this.addData = {
                  id,
                  name,
                  remark,
                  vendorId
                }
              }
            })
          }
          break
        case 2:
          this.ruleData = {
            vendorId: item.vendorId,
            groupId: item.id,
            portMin: '',
            portMax: '',
            direction: '0',
            protocol: 'TCP',
            type: 'subnet',
            ip: '',
            netmask: ''
          }
          break
      }
    },
    // 模态框确认
    dialogOk(index) {
      switch (index) {
        case 1:
          const data = this.$refs.securityItem.getPostData()
          getVdc({
            page: 1,
            rows: 10,
            params: this.$tools.handleSearchParam({
              vendorId: data.vendorId
            })
          }).then(data1 => {
            if (data1.success) {
              const vdc = data1.data.rows
              data.vdcId = vdc[0].id
              if (!data) return
              if (data.id) {
                modifyGroup(data).then(data => {
                  if (data.success) {
                    this.$message({
                      type: 'success',
                      message: data.message
                    })
                    this.addFlag = false
                    this.getData()
                  }
                })
              } else {
                createGroup(data).then(data => {
                  if (data.success) {
                    this.$message({
                      type: 'success',
                      message: data.message
                    })
                    this.addFlag = false
                    this.getData()
                  }
                })
              }
            }
          })
          break
        case 2:
          const data1 = this.$refs.securityRule.getPostData()
          if (!data1) return
          createGroupRule(data1).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.getData()
              this.ruleFlag = false
              this.ruleData = {
                portMin: '',
                portMax: '',
                direction: '0',
                protocol: 'TCP',
                type: 'subnet'
              }
            }
          })
          break
      }
    },
    // 模态框退出及取消触发事件
    cancel(formName, flag) {
      this[flag] = false
      this.$refs[formName].resetFields()
    },
    // 模态框ESE事件
    handleClose(done) {
      const list = ['addFlag', 'ruleFlag']
      for (let i = 0; i < list.length; i++) {
        if (this[list[i]]) {
          switch (list[i]) {
            case 'addFlag':
              this.cancel('addData', 'addFlag')
              break
            case 'ruleFlag':
              this.cancel('ruleData', 'addFlag')
              break
          }
        }
      }
    }
  },
  created() {},
  mounted() {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
