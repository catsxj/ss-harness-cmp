<template>
  <el-card>
    <el-row :gutter="10">
      <el-col :span="6" class="left-box">
        <div class="formBox">
          <el-form @keyup.enter.native="_getDocumentSearch" label-width="0px">
            <el-form-item style="width: 100%">
              <el-input style="width: 100%" placeholder="搜索使用文档" v-model="searchData.name" prefix-icon="el-icon-search"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <el-tree class="tree-menu" :data="dataSource" :props="defaultProps" @node-click="handleSelect"></el-tree>
      </el-col>
      <el-col :span="18" style="width: calc(100% - 286px)" class="auto">
        <div v-if="!detailVisible">暂无使用文档</div>
        <div v-else>
          <mavon-editor class="md" :value="detailData.content" :subfield="prop.subfield" :defaultOpen="prop.defaultOpen" :toolbarsFlag="prop.toolbarsFlag" :editable="prop.editable" :boxShadow="false" :scrollStyle="prop.scrollStyle"></mavon-editor>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { getDocument, getDocumentDetail, getDocumentSearch } from 'services/system/document'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
export default {
  components: { mavonEditor },
  data() {
    return {
      dataSource: [],
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      detailVisible: false,
      // 新增界面数据
      detailData: {},
      total1: 0,
      searchData: {
        name: ''
      },
      active: 'a0',
      defaultProps: {
        label: 'name',
        children: 'children'
      },
      detailArr: [],
      documents: []
    }
  },
  computed: {
    prop() {
      const data = {
        subfield: false,
        defaultOpen: 'preview',
        editable: false,
        toolbarsFlag: false,
        scrollStyle: true
      }
      return data
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleSelect(data) {
      this.getDetail(data.id)
    },
    handleSource(item, item1) {
      if (item.categoryId == item1.id) {
        item1.children.push(item)
      } else if (item1.children) {
        item1.children.forEach(item2 => {
          this.handleSource(item, item2)
        })
      }
    },
    getList() {
      this.detailVisible = false
      getDocument({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          status: 'PUBLISHED',
          category: 'CSC'
        })
      }).then(data => {
        if (data.success) {
          this.dataSource = data.data
        }
      })
    },
    async _getDocumentSearch() {
      const params = {
        name: this.searchData.name,
        status: 'PUBLISHED',
        category: 'CSC'
      }
      const res = await getDocumentSearch(params)
      if (res.success) {
        this.dataSource = res.data
      }
    },
    handleSearch() {
      this.params.page = 1
      this.getList()
    },
    getDetail(id) {
      getDocumentDetail(id).then(data => {
        if (data.success) {
          this.detailData = {
            ...data.data
          }
          this.detailVisible = true
        }
      })
    },
    goBack() {
      this.detailVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.left-box {
  width: 286px;
  height: calc(100vh - 130px);
  .formBox {
    height: 40px;
    background-color: #f2f7fb;
    padding: 20px 10px;
    .el-form-item {
      margin-bottom: 0px;
    }
  }
  .tree-menu {
    overflow-y: auto;
    height: calc(100% - 80px);
    background-color: rgb(248, 251, 253);
    & ::v-deep .el-tree-node__content {
      padding: 6px 0;
    }
  }
}
.md {
  background-color: white !important;
  .v-note-panel {
    border: none !important;
    .v-show-content {
      background-color: white !important;
    }
  }
}
.auto {
  height: calc(100vh - 130px);
  overflow: auto;
  &::-webkit-scrollbar {
    width: 1px;
    height: 1px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 100px;
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
  }
}
.el-divider {
  margin: 0px;
}
.document-body {
  &:hover {
    -webkit-box-shadow: 0px 0px 3px #c8c8c8;
    -moz-box-shadow: 0px 0px 3px #c8c8c8;
    box-shadow: 0px 0px 3px #c8c8c8;
  }
  padding: 10px 20px 20px 20px;
}
.document-text {
  cursor: pointer;
  &:hover {
    color: red;
  }
}
</style>
