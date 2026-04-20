<template>
  <div>
    <AdvanceTable :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="add"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <el-button type="text" @click="getDetail(record.id)">{{ record.name }}</el-button>
      </template>
      <template #region="val, record">
        <span>{{ record.regionName }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" v-if="record.vendorType != 'AZURE' && record.vendorType != 'TCE'" @click="dropdownClick({ index: 1, id: record.id })"><i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多操作<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="dropdownClick({ index: 2, id: record.id })"> 删除 </el-dropdown-item>
            <el-dropdown-item @click.native="dropdownClick({ row: record, index: 3 })"> 添加规则 </el-dropdown-item>
            <el-dropdown-item @click.native="setTags(record)"> 分配标签 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBack">
      <el-tabs v-model="active" @tab-click="getDetailRule(1)">
        <el-tab-pane label="入站规则" name="Inbound">
          <el-form :inline="true">
            <el-form-item>
              <el-button @click="dropdownClick({ row: detail, index: 3 })" type="primary"> 新增 </el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailRule" :total="ruleDetailTotal">
            <el-table-column prop="priority" label="优先级" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol }}
              </template>
            </el-table-column>
            <el-table-column prop="sourceAddressPrefix" label="源" show-overflow-tooltip></el-table-column>
            <el-table-column prop="sourcePortRange" label="源端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="destinationAddressPrefix" label="目标" show-overflow-tooltip></el-table-column>
            <el-table-column prop="destinationPortRange" label="目标端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="remark" label="规则策略" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.action == 'Allow' ? '允许' : '拒绝' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160px">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-edit" :disabled="scope.row.defaultRule" @click="editRule(scope.row)"> 修改 </el-button>
                <div class="action-divider"></div>
                <el-button type="text" icon="el-icon-delete" :disabled="scope.row.defaultRule" @click="ruleRemove(scope.row)">删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="出站规则" name="Outbound">
          <el-form :inline="true">
            <el-form-item>
              <el-button @click="dropdownClick({ row: detail, index: 3 })" type="primary"> 新增 </el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailRule" :total="ruleDetailTotal">
            <el-table-column prop="priority" label="优先级" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol }}
              </template>
            </el-table-column>
            <el-table-column prop="sourceAddressPrefix" label="源" show-overflow-tooltip></el-table-column>
            <el-table-column prop="sourcePortRange" label="源端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="destinationAddressPrefix" label="目标" show-overflow-tooltip></el-table-column>
            <el-table-column prop="destinationPortRange" label="目标端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="remark" label="规则策略" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.action == 'Allow' ? '允许' : '拒绝' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160px">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-edit" :disabled="scope.row.defaultRule" @click="editRule(scope.row)"> 修改 </el-button>
                <div class="action-divider"></div>
                <el-button type="text" icon="el-icon-delete" :disabled="scope.row.defaultRule" @click="ruleRemove(scope.row)">删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <add :add-data="addData" v-if="addData.dialog" @getData="getData"></add>
    <add-rule :add-data="addRuleData" v-if="addRuleData.dialog" @back="getDetailRule"></add-rule>
    <edit-rule :add-data="editRuleData" v-if="editRuleData.dialog" @back="getDetailRule"></edit-rule>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getData"></tags>
  </div>
</template>

<script>
import add from './dialog/add.vue'
import addRule from './dialog/rule.vue'
import editRule from './dialog/editRule.vue'
import tags from '@/components/tag/index.vue'
import { secruityProtocol } from 'filters'
import { removeGroups, removeGroupRules, getGroup, removeGroup, modifyGroup, createGroup, detailGroup, getGroupRule, createGroupRule, removeGroupRule, detailGroupRule } from 'services/platform/index'
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '资源组',
    prop: 'azureResourceGroupName'
  },
  {
    label: '区域',
    prop: 'region',
    scopedSlots: { customRender: 'region' }
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    add,
    addRule,
    editRule,
    tags
  },
  props: {
    platformObject: {
      type: Object
    }
  },
  data() {
    return {
      ruleDetailData: [],
      ruleDetailTotal: 0,
      searchConfigs,
      columns,
      loading: false,
      paramd: {
        page: 1,
        rows: 10
      },
      detail: '',
      detailSetting: {
        type: 'safe_group',
        columns: [
          [
            { name: '名称', value: 'name' },
            { name: '创建时间', value: 'gmtCreate' },
            { name: '描述', value: 'remark' }
          ],
          [
            { name: '所属平台', value: 'vendorName' },
            { name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' },
            { name: '标签', value: 'tags' }
          ]
        ]
      },
      detailFlag: false,
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0,
      addFlag: false,
      directionData: {
        ingress: '入口',
        egress: '出口'
      },
      addData: {
        dialog: '',
        title: '新增',
        data: {}
      },
      addRuleData: {
        dialog: false,
        data: {}
      },
      editRuleData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      },
      active: 'Inbound',
      sourceType: 'Any',
      destination: 'Any'
    }
  },
  methods: {
    setTags(data) {
      const tags = []
      if (data.tags) {
        const tag = JSON.parse(data.tags)
        for (const i in tag) {
          tags.push({ key: i, value: tag[i] })
        }
      }
      this.tagData = {
        dialog: true,
        data: {
          resourceId: data.id,
          action: 'SECURITYGROUP',
          tags: tags
        }
      }
    },
    add() {
      this.addData = {
        dialog: true,
        title: '新增安全组',
        data: {
          vendorId: '',
          region: '',
          availablitiyZone: ''
        }
      }
    },
    // 模态框关闭事件
    close(data, title) {
      this.$refs[title].resetFields()
    },
    editRule(obj) {
      const data = {
        ...obj
      }
      if (data.sourceAddressPrefix !== 'Any' && data.sourceAddressPrefix !== '*') {
        data.sourceAddressPrefix = JSON.parse(data.sourceAddressPrefix)
        data.sourceAddressPrefix = data.sourceAddressPrefix.join(',')
        this.sourceType = 'ip'
      }
      if (data.destinationAddressPrefix !== 'Any' && data.destinationAddressPrefix !== '*') {
        data.destinationAddressPrefix = JSON.parse(data.destinationAddressPrefix)
        data.destinationAddressPrefix = data.destinationAddressPrefix.join(',')
        this.destination = 'ip'
      }
      if (data.sourcePortRange !== '*') {
        data.sourcePortRange = JSON.parse(data.sourcePortRange)
        data.sourcePortRange = data.sourcePortRange.join(',')
      }
      if (data.destinationPortRange !== '*') {
        data.destinationPortRange = JSON.parse(data.destinationPortRange)
        data.destinationPortRange = data.destinationPortRange.join(',')
      }
      this.editRuleData = {
        dialog: true,
        needDirection: !this.detailFlag,
        sourceType: this.sourceType,
        destination: this.destination,
        data: data
      }
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
            this.getDetailRule()
          }
        })
      })
    },
    getDetail(id) {
      detailGroup(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detailFlag = true
          this.active = 'Inbound'
          this.getDetailRule(1)
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getDetailRule(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([{ param: { groupId: this.detail.id, direction: this.active }, sign: 'EQ' }])
      getGroupRule(this.paramd).then(data => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
        }
      })
    },
    getData() {
      this.loading = true
      getGroup(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    remove(id) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该安全组，是否继续！', '提示', {
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
            this.getData()
          }
        })
      })
    },
    dropdownClick(command) {
      switch (command.index) {
        case 1:
          this.addData = {
            dialog: true,
            title: '编辑安全组',
            data: {}
          }
          detailGroup(command.id).then(data => {
            if (data.success) {
              const detail = data.data
              const updateItem = ['id', 'name', 'remark', 'vendorId', 'regionId', 'vendorType']
              for (let i = 0; i < updateItem.length; i++) {
                const item = updateItem[i]
                this.$set(this.addData.data, item, detail[item])
              }
            }
          })
          break
        case 2:
          this.remove(command.id)
          break
        case 3:
          this.addRuleData = {
            dialog: true,
            needDirection: !this.detailFlag,
            data: {
              direction: this.detailFlag ? this.active : 'Inbound',
              protocol: 'Tcp',
              vendorId: command.row.vendorId,
              groupId: command.row.id,
              remoteIpPrefix: '0.0.0.0/0',
              priority: 100,
              action: 'Allow',
              sourcePortRange: '*',
              destinationPortRange: '*'
            }
          }
          break
      }
    }
  },
  created() {
    this.getData()
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
    }
  },
  mounted() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
