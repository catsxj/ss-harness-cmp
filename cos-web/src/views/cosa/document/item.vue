<template>
  <el-card>
    <AdvanceTable :card-border="false" :tree-props="{ children: 'children', hasChildren: 'hasChidren' }" row-key="id" :data="list" :params="params" :columns="columns" :get-list="getList" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus" :disabled="list.length !== 0">新增根节点</el-button>
        <el-switch style="margin-left: 30px" v-if="category === 'CSC'" v-model="switchValue" @change="switchChange" active-text="自服务可见" inactive-text="自服务不可见"></el-switch>
      </template>
      <div slot="pagination"></div>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="status">
        {{ status == 'PUBLISHED' ? '发布' : '下架' }}
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreateSub(record.id)" icon="el-icon-plus"> 新增</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleCreate(record)" icon="el-icon-edit"> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)" icon="el-icon-delete"> 删除</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="modify(record, record.status == 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED')">
          <svg-icon :icon-name="record.status == 'PUBLISHED' ? 'svg-disabled' : 'el-icon-video-pause'"></svg-icon>
          {{ record.status == 'PUBLISHED' ? '下架' : '发布' }}
        </el-button>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <add :add-data="addData" v-if="addData.dialog" @back="getList"></add>
    <common-detail v-if="detailVisible" :setting="{ logoText: '文档' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="创建人">{{ detailData.username }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      </template>
      <!-- <div name="content" id="content"></div> -->
      <mavon-editor class="md" :value="detailData.content" :subfield="prop.subfield" :defaultOpen="prop.defaultOpen" :toolbarsFlag="prop.toolbarsFlag" :editable="prop.editable" :boxShadow="false" :scrollStyle="prop.scrollStyle" style="background: #fff"></mavon-editor>
    </common-detail>
  </el-card>
</template>

<script>
import add from './catalog.vue'
import { getDocument, removeDocument, getDocumentDetail, modifyDocument, patchDocumentStatus, getDocumentStatus } from 'services/system/document'

const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    width: '380px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    add
  },
  props: {
    category: {
      type: String,
      default: 'CMC'
    }
  },
  data() {
    return {
      addData: {
        dialog: false,
        data: {
          category: ''
        }
      },
      switchValue: true,
      expandenKeys: [],
      type: '',
      list: [],
      loading: false,
      params: {},
      detailVisible: false,
      // 新增界面数据
      detailData: {},
      total1: 0,
      searchData: {
        name: ''
      },
      columns
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
    this._getDocumentStatus()
  },
  methods: {
    async _getDocumentStatus() {
      const res = await getDocumentStatus()
      if (res.success) {
        this.switchValue = res.data
      }
    },
    async switchChange(value) {
      this.switchValue = value
      const params = {
        display: value
      }
      const res = await patchDocumentStatus(params)
      if (res.success) {
        this.$message.success(res.message)
      }
    },
    getList() {
      this.loading = true
      const params = JSON.stringify([{ param: { category: this.category }, sign: 'EQ' }])
      this.params.params = params
      getDocument(this.params).then((data) => {
        if (data.success) {
          this.list = data.data
        }
        this.loading = false
      })
    },
    handleCreate(data) {
      if (data) {
        this.$router.push({
          name: 'documentModify',
          params: { id: data.id }
        })
      } else {
        this.$router.push({
          name: 'documentAdd',
          params: { id: 0 }
        })
      }
    },
    handleCreateSub(id) {
      this.addData = {
        dialog: true,
        data: {
          parentId: id,
          category: this.category
        }
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
    modify(data, type) {
      this.$confirm(`您确定要${type == 'PUBLISHED' ? '发布' : '下架'}该产品吗?`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        modifyDocument({
          ...data,
          status: type
        }).then((data) => {
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
.authDetail {
  display: inline-block;
  width: calc(100% / 3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v-show.contnet {
  background-color: #fff !important;
}
</style>
