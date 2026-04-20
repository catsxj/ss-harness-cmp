<template>
  <el-card>
    <table-search :configs="searchConfigs" :onSearch="handleSearch">
      <template v-slot:operate>
        <el-button type="primary" @click="handleCreate()"> <Icon type="icon-add"></Icon> 新增 </el-button>
      </template>
    </table-search>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column show-overflow-tooltip label="名称">
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="创建人" prop="creatorName"> </el-table-column>
      <el-table-column show-overflow-tooltip label="创建时间" prop="gmtCreate"> </el-table-column>
      <el-table-column show-overflow-tooltip label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" :disabled="scope.row.status == 'Approved' || scope.row.status == 'Invalid' || scope.row.status == 'Approving'" @click="handleCreate(scope.row)"><i class="el-icon-edit"></i> 编辑</el-button>
          <div class="action-divider"></div>
          <el-button type="text" :disabled="scope.row.status == 'Approved' || scope.row.status == 'Invalid' || scope.row.status == 'Approving'" @click="handleDelete(scope.row.id)"><i class="el-icon-delete"></i> 删除</el-button>
        </template>
      </el-table-column>
    </basic-table>
    <!--详情界面-->
    <common-detail v-if="detailVisible" :setting="{ logoText: 'DOCU' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="创建人">{{ detailData.creatorName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      </template>
      <div name="content" id="content"></div>
    </common-detail>
  </el-card>
</template>
<script>
import { getDocument, removeDocument, getDocumentDetail } from 'services/system/document'
export default {
  components: {},
  data() {
    return {
      list: null,
      roleData: [],
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      detailVisible: false,
      // 新增界面数据
      detailData: {},
      total1: 0
    }
  },
  created() {},
  computed: {
    searchConfigs() {
      return [{ type: 'Input', label: '名称', value: 'name' }]
    }
  },
  methods: {
    getList() {
      getDocument(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params || this.params.params
      this.getList()
    },
    handleCreate(data) {
      if (data) {
        this.$router.push({
          name: 'documentModify',
          query: { id: data.id }
        })
      } else {
        this.$router.push({
          name: 'documentAdd'
        })
      }
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该产品吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeDocument(id).then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    getDetail(id) {
      this.detailVisible = true
      getDocumentDetail(id).then((data) => {
        if (data.success) {
          this.detailData = data.data
          document.getElementById('content').innerHTML = this.detailData.content
        }
      })
    },
    goBack() {
      this.detailVisible = false
    }
  }
}
</script>
