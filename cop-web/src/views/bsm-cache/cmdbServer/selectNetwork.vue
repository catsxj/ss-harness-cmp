<template>
  <el-container class="cmdb-resource-container">
    <el-main style="padding: 0;">
      <div>
        <el-alert
          title="请先选择设备类型"
          style="margin-bottom: 10px;"
          type="warning">
        </el-alert>
        <el-form inline class="search">
          <el-row>
            <el-col :span="24">
              <el-form-item>
                <el-select v-model="netType" placeholder="设备类型" clearable filterable @change="changeType">
                  <el-option v-for="item in netList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-input placeholder="资源名称" v-model="simpleName" :disabled="searchDialog.show" clearable @keyup.enter.native="getResourceList()">
                  <el-button slot="append" icon="el-icon-search" @click="getResourceList()"></el-button>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="ghost" @click="changeSuperSearch">
                  <i class="iconfont iconsousuo"></i>
                  高级搜索
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button @click="reset" icon="el-icon-refresh">重置</el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="selectAll" :loading="selectAllLoading" :disabled="!netType">
                  {{ hasSelectAll[netType] ? '清空' : '全选' }}
                </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item v-if="searchDialog.show">
                <super-search
                  ref="superSearch"
                  :dialog="searchDialog"
                  :hostAttrsList="hostAttrsList"
                  :handleAttr="handleAttr"
                  :searchFn="getResourceList"
                  >
                </super-search>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <basic-table ref="muluTable" :data="resourceList" :params="paramt" :get-list="getResourceByTable"
                    :total="paramt.total" @select="handleSelectItem" @select-all="handleSelectAll">
          <el-table-column type="selection">
          </el-table-column>
          <el-table-column  prop="name" label="资源名称" min-width="120" show-overflow-tooltip>
            <template v-slot="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <template v-for="(item, index) in hostAttrsList">
            <el-table-column  v-if="(item.code !== 'name') && item.isGrid && handleAttr(item.type)" :key="index"
              :label="item.name" show-overflow-tooltip>
              <template v-slot="scope">
                <span>{{scope.row[item.code]}}</span>
              </template>
            </el-table-column>
          </template>
        </basic-table>
      </div>
    </el-main>
  </el-container>
</template>
<script>
import { handleDataAddAttr } from 'views/configCenter/resource/mulu/utils/property'
import { getSystems, getDicts } from 'services/task/inspect'
import { getModuls } from 'services/task/cmdb'
export default {
  components: {
    superSearch: () => import('views/configCenter/resource/mulu/components/superSearch')
  },
  props: {
    selectData: {
      type: Array,
      default: () => {
        return []
      }
    },
    moduleCode: {
      type: String
    },
    dictType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      searchData: {},
      hostAttrsList: [],
      searchDialog: {
        show: false
      },
      resourceList: [],
      simpleName: '',
      netList: [],
      list: [],
      idList: {},
      selectList: [],
      selectAllLoading: false,
      hasSelectAll: {},
      checkData: {
        name: true
      },
      paramt: {
        total: 0,
        page: 1,
        rows: 10
      },
      netType: ''
    }
  },
  mounted () {
    this.getTypeList()
    // 已选择数据
    this.selectData && this.selectData.forEach(item => {
      if (!this.idList[item.code]) {
        this.idList[item.code] = []
      }
      this.idList[item.code].push(item.id)
      this.selectList.push(item)
    })
  },
  methods: {
    // 重置
    reset () {
      this.simpleName = ''
      if (this.searchDialog.show && this.$refs.superSearch) {
        this.$refs.superSearch.clearData()
      }
      this.getResourceList()
    },
    selectAll () {
      this.selectAllLoading = true
      // 取消全选
      if (this.hasSelectAll[this.netType]) {
        this.paramt.rows = 10
        this.selectList = []
        this.idList = []
        this.getResourceList()
      } else {
        // 全选
        this.paramt.rows = 9999
        this.getResourceList('selAll')
      }
      this.hasSelectAll[this.netType] = !this.hasSelectAll[this.netType]
    },
    changeType () {
      this.getPropertyByCode().then(_ => {
        this.getResourceList()
      })
    },
    getTypeList () {
      this.selectObj = {};
      this.hostList = [];
      getDicts({
        value: this.dictType
      }).then(res => {
        if (res.success) {
          this.netList = res.data
          if (this.netList?.length > 0) {
            if (this.moduleCode) {
              this.netType = this.moduleCode
              this.changeType()
            }
          }
        }
      })
    },
    // 取消
    cancle () {
      this.searchDialog.show = false
      this.reset()
    },
    // 属性处理
    handleAttr (data, type) {
      if (data !== 'TEXTENCRYPT' && data !== 'GROUP' && data !== 'TABLE') {
        return true
      }
      return false
    },
    // 通过code获取属性字段, 用于采集任务
    getPropertyByCode () {
      return new Promise((resolve, reject) => {
        getModuls({ moduleCode: this.netType }).then(data => {
          if (data.success) {
            this.hostAttrsList = []
            const _properties = data.data.properties
            for (const property of _properties) {
              let decimalNum = 0
              const { code, name, isRequired, type, isGrid, item, isUnique } = property
              if (property.decimalNum) {
                decimalNum = property.decimalNum
              }
              if (code !== 'id') {
                this.hostAttrsList.push({ code, name, isRequired, type, isGrid, item, decimalNum, isUnique })
                this.$set(this.checkData, code, isGrid)
              }
            }
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 查询资源列表
    getResourceList (type) {
      const _search = {}
      const params = {
        page: this.paramt.page,
        rows: this.paramt.rows,
        sorter: JSON.stringify({ gmtCreate: '1' })
      }
      const param = this.searchDialog.show ? this.$refs.superSearch.getSearchData() : this.simpleName
      for (const key of Object.keys(param)) {
        if (param[key]) {
          _search[key] = param[key]
        }
      }
      this.searchData = _search || this.searchData
      params.params = JSON.stringify([{
        moduleCode: this.netType,
        conditions: [
          {
            param: this.searchData,
            sign: 'LK'
          }
        ]
      }])
      getSystems(params).then(data => {
        if (data.success) {
          this.resourceList = handleDataAddAttr(data.data.rows, this.hostAttrsList)
          this.paramt.total = data.data.total
          if (this.hasSelectAll[this.netType]) {
            this.resourceList.forEach(item => {
              this.$nextTick(() => {
                this.$refs.muluTable.toggleRowSelection(item, true)
                this.moniSelectItem(this.resourceList, item)
              })
            })
          } else {
            // 分页切换时保存已选择的
            this.idList[this.netType]?.length > 0 && this.resourceList.forEach(item => {
              if (this.idList[this.netType].indexOf(item.id) > -1) {
                this.$nextTick(() => {
                  this.$refs.muluTable.toggleRowSelection(item, true)
                })
              }
            })
            // 回显
            this.selectData && this.resourceList.forEach(item => {
              if (this.selectData.indexOf(item.id) > -1) {
                this.$nextTick(() => {
                  this.$refs.muluTable.toggleRowSelection(item, true)
                })
              }
            })
          }
        }
      }).finally(_ => {
        this.selectAllLoading = false
      })
    },
    // 高级搜索
    changeSuperSearch () {
      this.searchDialog.show = !this.searchDialog.show
    },
    save () {
      return {
        data: this.selectList,
        code: this.netType
      }
    },
    // 单选
    handleSelectItem (selection, row) {
      this.moniSelectItem(selection, row)
    },
    // 模拟单选
    moniSelectItem (selection, row) {
      let isHas = false
      for (const item of selection) {
        if (item.id === row.id) {
          // 选中
          isHas = true
          break
        }
      }
      if (!isHas) {
        // 取消选中
        this.selectList.forEach((item, index) => {
          if (item.id === row.id && item.code === this.netType) {
            this.selectList.splice(index, 1)
          }
        })
      } else {
        // 选中
        selection.forEach(item => {
          item.code = this.netType
          if (!this.idList[this.netType]) {
            this.idList[this.netType] = []
          }
          this.idList[this.netType].push(item.id)
          let flag = false
          this.selectList.forEach(v => {
            if (v.id === item.id && v.code === item.code) {
              // 已保存的数据中已存在
              flag = true
            }
          })
          if (!flag) {
            if (!(item.outbond_manage_ip || item.inbond_manage_ip || item.service_ip || item.ip)) {
              this.$message.error(item.name + '的ip地址不存在，请确保数据准确')
              this.$refs.muluTable.toggleRowSelection(item, false)
              return
            }
            this.selectList.push(item)
          }
        })
        this.idList[this.netType] = Array.from(new Set(this.idList[this.netType]))
      }
    },
    // 全选
    handleSelectAll (selection) {
      // 选中
      if (selection?.length > 0) {
        selection.forEach(item => {
          if (!this.idList[this.netType]) {
            this.idList[this.netType] = []
          }
          if (this.idList[this.netType]?.indexOf(item.id) === -1) {
            // 不存在
            if (!(item.outbond_manage_ip || item.inbond_manage_ip || item.service_ip || item.ip)) {
              this.$message.error(item.name + '的ip地址不存在，请确保数据准确')
              this.$refs.muluTable.toggleRowSelection(item, false)
              return
            }
            item.code = this.netType
            this.idList[this.netType].push(item.id)
            this.selectList.push(item)
          }
        })
      } else {
        const afterCancleList = [], hasDataList = []
        // 取消选中
        this.resourceList.forEach(item => {
          if (this.idList[this.netType].indexOf(item.id) > -1 && item.code === this.netType) {
            // 待删除id列表
            hasDataList.push(item.id)
          }
        })
        for (const selItem of this.selectList) {
          if (hasDataList.indexOf(selItem.id) === -1 && selItem.code !== this.netType) {
            afterCancleList.push(selItem)
          }
        }
        this.selectList = afterCancleList
      }
    },
    // 表格获取数据
    getResourceByTable (page) {
      this.paramt.page = page || this.paramt.page
      this.getResourceList()
    }
  }
}
</script>
<style lang="scss">
  .cmdb-resource-container {
    background: #fff;
    margin: 0;
  }
</style>
