<template>
  <el-row>
    <el-col :span="24">
      <el-button type="primary" size="small" class="m-b-sm" @click="selectItem()"> <Icon type="icon-desktop"></Icon> 选择 </el-button>
    </el-col>
    <el-col :span="24">
      <smart-table :data="itemData[resourceType]" class="target-table">
        <el-table-column label="名称" prop="targetDisplayName" show-overflow-tooltip> </el-table-column>
        <el-table-column show-overflow-tooltip label="对象类别">
          <template v-slot="scope">
            {{ scope.row.targetType | targetTypeFilter }}
          </template>
        </el-table-column>
      </smart-table>
    </el-col>
    <el-dialog v-if="dialogVisible" title="设置" :close-on-click-modal="false" :visible.sync="dialogVisible" width="800px" append-to-body>
      <el-form :inline="true">
        <el-form-item label="对象类型：">
          <el-select v-model="targetType" @change="getData">
            <el-option value="LogicalSwitch" label="子网" v-if="resourceType === 'sources'"></el-option>
            <el-option value="LogicalRouter" label="VPC" v-if="resourceType === 'sources'"></el-option>
            <el-option value="LogicalPort" label="逻辑端口" v-if="resourceType === 'sources'"></el-option>
            <el-option value="IPAddress" label="IP地址"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-card style="height: 408px">
            <div slot="header">
              <span>对象列表</span>
              <el-button type="primary" class="pull-right" size="mini" :disabled="leftSlection.length === 0" @click="addSelection">移入<Icon type="icon-right-arrow"></Icon> </el-button>
            </div>
            <basic-table ref="table" :small="true" :data="listData" @selection-change="leftSelectionChange" :otherProps="{ height: '340px' }">
              <el-table-column type="selection" :selectable="selectAble" width="60"> </el-table-column>
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <div slot="pagination"></div>
            </basic-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="height: 408px">
            <div slot="header">
              <span class="pull-right">已选对象</span>
              <el-button type="danger" size="mini" @click="removeSelection" :disabled="rightSlection.length === 0"> <Icon type="icon-left-arrow"></Icon> 移除 </el-button>
            </div>
            <smart-table :data="selectList" :rows="5" @selection-change="rightSelectionChange">
              <el-table-column type="selection" width="60"> </el-table-column>
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <el-table-column show-overflow-tooltip label="对象类别" prop="email">
                <template v-slot="scope">
                  {{ scope.row.targetType | targetTypeFilter }}
                </template>
              </el-table-column>
            </smart-table>
          </el-card>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="submit">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>
<script>
import { getLogicalSwitch, getNsGroup } from 'services/platform/nsx/index'
import { getRouter } from 'services/platform/nsx/router'
import { getPort } from 'services/platform/nsx/switch_port'
import { targetTypeFilter } from './filters'

export default {
  props: {
    resourceType: {
      type: String
    },
    itemData: {
      type: Object
    },
    ipList: {
      type: Array
    },
    mysqlData: {
      type: Object
    }
  },
  data() {
    return {
      targetType: '',
      listData: [],
      total: 0,
      listQuery: {
        name: ''
      },
      leftSlection: [],
      // 右侧
      selectList: [],
      rightSlection: [],
      dialogVisible: false,
      // ip地址
      addData: {
        targetId: ''
      }
    }
  },
  computed: {
    uuidArr() {
      return this.selectList.map(item => item.targetId)
    }
  },
  created() {},
  methods: {
    selectItem() {
      // 重置数据
      this.listData = []
      this.targetType = ''
      this.selectList = (this.itemData[this.resourceType] || []).map(item => {
        return {
          ...item,
          name: item.targetDisplayName
        }
      })
      this.dialogVisible = true
    },
    submit() {
      this.dialogVisible = false
      this.itemData[this.resourceType] = this.selectList.map(item => {
        const { name, targetId, targetType } = item
        return {
          targetDisplayName: name,
          targetId,
          targetType,
          isValid: true
        }
      })
    },
    getData() {
      const callback = data => {
        const targetMap = {
          LogicalSwitch: 'switchId',
          LogicalPort: 'portId',
          LogicalRouter: 'routerId',
          IPAddress: 'address'
        }
        this.listData = data.map(item => {
          return {
            ...item,
            targetType: this.targetType,
            targetId: item[targetMap[this.targetType]]
          }
        })
        // 选中反选
        this.$nextTick(() => {
          this.listData.forEach(item => {
            if (this.uuidArr.indexOf(item.targetId) > -1) this.$refs.table.toggleRowSelection(item, true)
          })
        })
      }
      switch (this.targetType) {
        case 'IPAddress':
          callback(
            this.ipList.map(item => {
              return {
                ...item,
                name: item.address
              }
            })
          )
          break
        case 'LogicalSwitch':
          getLogicalSwitch({ condition: JSON.stringify({ condition: 'listTenantSwitchs' }) }).then(data => {
            if (data.success) {
              callback(data.data)
            }
          })
          break
        case 'LogicalPort':
          const { type: category, id: target } = this.mysqlData
          getPort({ condition: JSON.stringify({ condition: 'fwSwitchPorts', category, target }) }).then(data => {
            if (data.success) {
              callback(data.data)
            }
          })
          break
        case 'LogicalRouter':
          getRouter({ page: 1, rows: 10000, params: this.$tools.handleSearchParam({ routerType: 'TIER1' }) }).then(data => {
            if (data.success) {
              callback(data.data.rows)
            }
          })
          break
      }
    },
    leftSelectionChange(selection) {
      this.leftSlection = selection
    },
    rightSelectionChange(selection) {
      this.rightSlection = selection
    },
    selectAble(row) {
      return !this.uuidArr.includes(row.targetId)
    },
    addSelection() {
      const list = this.leftSlection.filter(item => {
        return !this.uuidArr.includes(item.targetId)
      })
      this.selectList.unshift(...list)
    },
    removeSelection() {
      const ids = []
      this.rightSlection.forEach(item => {
        ids.push(item.targetId)
      })
      for (let i = 0; i < this.selectList.length; i++) {
        const item = this.selectList[i]
        if (ids.includes(item.targetId)) {
          this.selectList.splice(i, 1)
          i--
        }
      }
    }
  },
  filters: { targetTypeFilter }
}
</script>
<style lang="scss" scope></style>
