<template>
  <el-container class="cmdb-resource-container">
    <el-main style="padding: 0;">
      <div>
        <el-form inline class="search">
          <el-row>
            <el-col :span="24">
              <el-form-item>
                <el-cascader :show-all-levels="false" expandTrigger="hover" placeholder="选择分组" v-model="cmdbSer" clearable :props='props' :options="options" @change="casChange(cmdbSer)"></el-cascader>
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
              <el-form-item v-if="!isJump">
                <el-button type="primary" @click="selectAll" :loading="selectAllLoading">
                  {{ hasSelectAll ? '清空' : '全选' }}
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
        <basic-table
          ref="muluTable"
          :data="resourceList"
          :params="paramt"
          :get-list="getResourceByTable"
          :total="paramt.total"
          @select="handleSelectItem"
          @select-all="handleSelectAll"
          :loading='selectAllLoading'>
          <el-table-column type="selection">
          </el-table-column>
          <el-table-column  prop="name" label="资源名称" min-width="120" show-overflow-tooltip>
            <template v-slot="scope">
              <span v-if="!isfrm" class="detail-href" @click="getDetail(scope.row.id, scope.row.name)">{{scope.row.name}}</span>
              <span v-else>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <template v-for="(item, index) in hostAttrsList">
            <el-table-column
              v-if="(item.code !== 'name') && item.isGrid && handleAttr(item.type)"
              :key="index"
              :label="item.name"
              show-overflow-tooltip>
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
import { decrypt } from 'utils/crypto'
import { handleDataAddAttr } from 'views/configCenter/utils/attrChange'
import { getAppLevels, getModuls, getTopos, getHostModule, getHostInstance } from 'services/task/cmdb'
export default {
  components: {
    superSearch: () => import('views/configCenter/resource/mulu/components/superSearch')
  },
  inject: {
    isJump: {
      default: () => {
        return false
      }
    }
  },
  props: {
    selectData: {
      type: Array,
      default: () => {
        return []
      }
    },
    moduleCode: {
      type: String,
      default: 'host'
    },
    moduleId: {
      type: Number
    },
    isfrm: {
      type: String,
      default: 'host'
    },
    isAgent: {
      type: Boolean,
      default: false
    }
  },
  data (self) {
    return {
      searchData: {},
      hostAttrsList: [],
      searchDialog: {
        show: false
      },
      resourceList: [],
      simpleName: '',
      list: [],
      idList: [],
      selectList: [],
      checkData: {
        name: true
      },
      paramt: {
        total: 0,
        page: 1,
        rows: 10
      },
      hasSelectAll: false,
      selectAllLoading: false,
      levelModuleId: '',
      currentLevel: null, // 当前层级
      cmdbSer: [],
      options: [],
      props: {
        lazy: true,
        label: 'name',
        value: 'id',
        checkStrictly: true,
        lazyLoad (node, resolve, reject) {
          let moduleId = '', instanceId = ''
          if (node?.data?.id) {
            const id = node?.data?.id || ''
            const val = id?.split('&&&') || []
            moduleId = val[0]
            instanceId = val[1]
            if (moduleId !== self.levelModuleId.toString()) {
              self.getChildInstance(moduleId, instanceId).then((data) => {
                if (data.isLast) {
                  data.instances && data.instances.forEach((item) => {
                    item.leaf = true;
                  })
                }
                const instances = data.instances
                instances.forEach(item => {
                  item.id = `${item.moduleId}&&&${item.id}`
                })
                resolve(instances)
              }).catch(_ => {
                resolve()
              })
            } else {
              resolve()
            }
          }
        }
      }
    }
  },
  mounted () {
    this.getHostId()
    this.getLevel()
    this.currentModuleCode = this.moduleCode
    this.getPropertyByCode().then(_ => {
      this.getResourceList()
    })
    // 已选择数据
    this.selectData && this.selectData.forEach(item => {
      this.idList.push(item.id)
      // 密码解密
      if (item.pasd) {
        item.pasd = decrypt(item.pasd)
      }
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
      if (this.hasSelectAll) {
        this.paramt.rows = 10
        this.selectList = []
        this.idList = []
        this.getResourceList()
      } else {
        // 全选
        this.paramt.rows = 9999
        this.getResourceList('selAll')
      }
      this.hasSelectAll = !this.hasSelectAll
    },
    // 获取模块moduleId
    getHostId () {
      getAppLevels().then(data => {
        if (data.success) {
          data.data.nodes.forEach(item => {
            if (item.code === 'module') {
              this.levelModuleId = item.id
            }
          })
        }
      })
    },
    getLevel () {
      this.cmdbSer = [];
      getHostModule().then(data => {
        if (data.success) {
          if (data.data) {
            this.getChildInstance(data.data.id, null).then((data) => {
              const instances = data.instances
              instances.forEach(item => {
                item.id = `${item.moduleId}&&&${item.id}`
              })
              this.options = instances;
            })
          }
        }
      })
    },
    casChange (data) {
      const lastValue = this.cmdbSer[this.cmdbSer.length - 1];
      const lastValueSpt = lastValue.split('&&&')
      this.currentLevel = {
        moduleId: lastValueSpt[0],
        id: lastValueSpt[1]
      }
      this.getResourceList()
    },
    getChildInstance (moduleId, instanceId) {
      return new Promise((resolve, reject) => {
        getHostInstance({
          moduleId,
          instanceId
        }).then(data => {
          if (data.success) {
            resolve(data.data)
          } else {
            reject(data.message)
          }
        })
      })
    },
    // 主机选择接口
    getSelectHost () {
      return {
        data: this.selectList,
        moduleCode: this.moduleCode
      }
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
        getModuls({ moduleCode: this.moduleCode }).then(data => {
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
      const url = '/cmdb/app/topo/hostListMessage'
      const params = {
        page: this.paramt.page,
        rows: this.paramt.rows,
        sorter: JSON.stringify({ gmtCreate: '1' })
      }
      let searchData = {}
      if (this.searchDialog.show && this.$refs.superSearch) {
        // 高级搜索
        searchData = this.$refs.superSearch.getSearchData()
      } else if (this.simpleName) {
        // 普通搜索
        if (this.simpleName) {
          searchData = { name: this.simpleName }
        }
      }
      for (const key of Object.keys(searchData)) {
        if (!searchData[key]) {
          searchData[key] = null
        }
      }
      this.searchData = searchData || this.searchData
      if (this.isAgent) {
        // 选择agent状态为正常的主机
        this.searchData.agent_status = '正常'
      }
      this.currentLevel = this.cmdbSer.length > 0 ? this.currentLevel : null
      if (this.currentLevel) {
        params.codeAndId = JSON.stringify({
          moduleId: this.currentLevel?.moduleId,
          instanceId: this.currentLevel?.id
        })
        params.params = JSON.stringify(
          [
            {
              param: this.searchData,
              sign: 'LK'
            }
          ])
      } else {
        params.params = JSON.stringify([
          {
            param: this.searchData,
            sign: 'LK'
          }
        ])
      }
      getTopos(params).then(data => {
        if (data.success) {
          this.resourceList = handleDataAddAttr(data.data.rows, this.hostAttrsList)
          this.paramt.total = data.data.total
          if (this.hasSelectAll) {
            this.resourceList.forEach(item => {
              this.$nextTick(() => {
                this.moniCheckItem(this.resourceList, item)
                this.$refs.muluTable.toggleRowSelection(item, true)
              })
            })
          } else {
            // 保存已选择的
            if (this.isfrm) {
              this.idList?.length > 0 && this.resourceList.forEach(item => {
                if (this.idList.indexOf(item.id) > -1) {
                  this.$nextTick(() => {
                    this.$refs.muluTable.toggleRowSelection(item, true)
                  })
                }
              })
            } else {
              this.idList = []
            }
            // 回显，用于主机、实例选择
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
      return this.selectList
    },
    // 复选框点击
    handleSelectItem (selection, row) {
      this.moniCheckItem(selection, row)
    },
    // 全选
    handleSelectAll (selection) {
      // 选中
      if (selection?.length > 0) {
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) === -1) {
            // 不存在
            if (!item.service_ip && !item.ip) {
              this.$message.error(item.name + '的ip地址不存在，请确保数据准确')
              this.$refs.muluTable.toggleRowSelection(item, false)
              return
            }
            this.idList.push(item.id)
            this.selectList.push(item)
          }
        })
      } else {
        const afterCancleList = [], idHash = {}
        // 取消选中
        this.resourceList.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            // 待删除id列表
            idHash[item.id] = true
          }
        })
        this.selectList = this.selectList.filter(item => !idHash[item.id])
      }
    },
    // 模拟单选点击复选框
    moniCheckItem (selection, row) {
      if (this.isfrm) {
        let isHas = false
        for (const item of selection) {
          if (item.id === row.id) {
            isHas = true
            break
          }
        }
        if (!isHas) {
          this.selectList.forEach((item, index) => {
            if (item.id === row.id) {
              this.selectList.splice(index, 1)
            }
          })
        } else {
          const idHash = {}
          this.selectList.forEach(item => {
            if (!idHash[item.id]) {
              idHash[item.id] = true
            }
          })
          selection.forEach(item => {
            if (!item.service_ip && !item.ip) {
              this.$message.error(item.name + '的ip地址不存在，请确保数据准确')
              this.$refs.muluTable.toggleRowSelection(item, false)
              return
            }
            this.idList.push(item.id)
            if (!idHash[item.id]) {
              this.selectList.push(item)
              idHash[item.id] = true
            }
          })
          this.idList = Array.from(new Set(this.idList))
        }
      } else {
        this.idList = []
        selection.forEach(item => {
          this.idList.push(item.id)
        })
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
