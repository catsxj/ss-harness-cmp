<template>
  <div>
    <div class="wrapper" v-if="!detaildialogVisible">
      <table-search :configs="searchConfigs" :onSearch="handleSearch">
        <el-button type="primary" @click="handleCreate()" slot="operate"> 新增 </el-button>
      </table-search>
      <basic-table :data="listData" :params="params" :get-list="getList" :total="total" ref="multipleTable">
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="firewallId" label="ID" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="160px" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDelete(scope.row)" icon="el-icon-delete"> 删除 </el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="handleRule(scope.row)" icon="el-icon-help"> 规则设置 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <Rule :detail-data="detail" :dialog="ruleDialog" :mysql-data="detailData" v-if="ruleDialog.visible"></Rule>
    <AddDialog v-if="addDialog.visible" :dialog="addDialog" @getData="getList"></AddDialog>
  </div>
</template>

<script>
import AddDialog from './addDialog.vue'
import Rule from './rule.vue'
import { getFirewall, removeFirewall, getFirewallDetail } from 'services/platform/nsx/firewall'
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
export default {
  components: {
    AddDialog,
    Rule
  },
  props: {
    detailData: {
      type: Object
    }
  },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'target', initValue: this.detailData.id },
        { type: 'Const', value: 'category', initValue: this.detailData.type }
      ],
      detaildialogVisible: false,
      ruleDialog: {
        visible: false
      },
      detail: {},
      params: {
        page: 1,
        rows: 10
      },
      nsList: [],
      listData: [],
      total: 0,
      addDialog: {
        visible: false
      }
    }
  },
  methods: {
    getList() {
      getFirewall(this.params).then(data => {
        if (data.success) {
          this.listData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleCreate(id) {
      this.addDialog = {
        visible: true,
        id: id,
        category: this.detailData.type,
        target: this.detailData.id
      }
    },
    handleRule(data) {
      this.detail = { ...data }
      this.ruleDialog.visible = true
    },
    handleDelete(data) {
      this.$confirm(`您确定要删除【${data.name}】吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFirewall(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    }
  },
  filters: {
    haModeFilter(value) {
      const map = {
        ACTIVE_ACTIVE: '主动-主动',
        ACTIVE_STANDBY: '主动-备用'
      }
      return map[value]
    }
  }
}
</script>

<style></style>
