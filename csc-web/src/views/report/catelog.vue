<template>
  <div>
    <el-form :inline="true" label-width="120px">
      <el-form-item label="名称：">
        <el-input v-model="searchName" auto-complete="off" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="search" @click="handleSearchs">搜索</el-button>
      </el-form-item>
    </el-form>
    <div class="table-container" style="margin: 20px; max-height: 158px; overflow-y: auto">
      <el-table ref="multipleTable" :data="list" @select="handleSelectItem" @select-all="handleSelectAll" stripe border fit>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="id" prop="id"> </el-table-column>
        <el-table-column label="名称" prop="name"> </el-table-column>
        <el-table-column label="描述">
          <template slot-scope="scope">
            {{ scope.row.remark ? scope.row.remark : '无' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination @size-change="handleSizeChanges" @current-change="getList" :current-page.sync="params.page" :page-sizes="[10, 50, 100, 500, 1000]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </div>
  </div>
</template>

<script>
import { getProject } from 'services/system/project'
import { getReportResource } from 'services/report/index'
export default {
  props: {
    reportCategory: {
      type: String
    }
  },
  data() {
    return {
      list: [],
      multipleSelection: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      searchName: '',
      vendorId: ''
    }
  },
  created() {
    this.handleSearchs()
  },
  methods: {
    getList() {
      if (this.reportCategory == 'Charge') this.getProject()
      else this.resource()
    },
    clearIds() {
      this.multipleSelection.forEach(item => {
        setTimeout(() => {
          this.$refs.multipleTable.toggleRowSelection(item, false)
        }, 100)
      })
      this.multipleSelection = []
    },
    clear() {
      this.multipleSelection = []
    },
    // 资源请求
    handleSizeChanges(val) {
      this.params.rows = val
      if (this.reportCategory == 'Charge') this.getProject()
      else this.resource()
    },
    // 资源搜索
    handleSearchs() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.vendorId,
        name: this.searchName
      })
      if (this.reportCategory == 'Charge') {
        this.getProject()
        return
      }
      const str = {
        param: {
          reportCategory: this.reportCategory
        },
        sign: 'EQ'
      }
      const list = JSON.parse(this.params.params)
      list.push(str)
      this.params.params = JSON.stringify(list)
      this.resource()
    },
    getProject() {
      getProject(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          const idList = []
          this.multipleSelection.forEach(data => {
            idList.push(data.id)
          })
          const that = this
          setTimeout(function () {
            for (let i = 0; i < that.list.length; i++) {
              const item = that.list[i]
              const mark = idList.indexOf(item.id)
              if (mark != -1) {
                that.$refs.multipleTable.toggleRowSelection(item)
              }
            }
          }, 100)
        }
      })
    },
    resource() {
      getReportResource(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          const idList = []
          this.multipleSelection.forEach(data => {
            idList.push(data.id)
          })
          const that = this
          setTimeout(function () {
            for (let i = 0; i < that.list.length; i++) {
              const item = that.list[i]
              const mark = idList.indexOf(item.id)
              if (mark != -1) {
                that.$refs.multipleTable.toggleRowSelection(item)
              }
            }
          }, 100)
        }
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      const idList = []
      this.multipleSelection.forEach(item => {
        idList.push(item.id)
      })
      if (idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.multipleSelection.length; j++) {
          if (this.multipleSelection[j].id == row.id) {
            this.multipleSelection.splice(j, 1)
            break
          }
        }
      } else {
        this.multipleSelection.push(row)
      }
      this.$emit('back', this.multipleSelection)
    },
    // 多选
    handleSelectAll(selection) {
      const idList = []
      this.multipleSelection.forEach(item => {
        idList.push(item.id)
      })
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (idList.indexOf(item.id) == -1) {
            this.multipleSelection.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
          this.multipleSelection.forEach((item1, index) => {
            if (item.id == item1.id) {
              this.multipleSelection.splice(index, 1)
            }
          })
        })
      }
      this.$emit('back', this.multipleSelection)
    }
  }
}
</script>

<style scoped></style>
