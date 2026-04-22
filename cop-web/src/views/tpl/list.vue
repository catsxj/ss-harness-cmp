<template>
  <AdvanceTable ref="tableRef" title="模板列表" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getList" :loading="loading">
    <template v-slot:action>
      <el-button @click="handleCreate('create')" type="primary" icon="el-icon-plus">新增 </el-button>
      <a class="el-button ghost el-button--small upload-file-btn">
        <i class="el-icon-upload2"></i> 导入
        <div id="btnTaskUpload"><input type="file" name="file" multiple="multiple" /></div>
      </a>
    </template>
    <template #name="val, record">
      <router-link class="detail-href" :to="{ name: 'TaskTplPreview', params: { id: record.id } }">
        {{ record.name }}
      </router-link>
    </template>
    <template #status="status">
      <status-icon :type="taskStatusFilter(status, 'color')">{{ taskStatusFilter(status) }}</status-icon>
    </template>
    <template #sceneName="sceneName">
      <el-tag>{{ sceneName }}</el-tag>
    </template>
    <template #operate="val, record">
      <template v-if="!record.internal">
        <el-button type="text" @click="handleCreate('modify', record.id)" :disabled="record.status !== 'DEVELOPING'"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)" :disabled="record.status !== 'DEVELOPING'"> <i class="el-icon-delete"></i> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多
            <i class="el-icon-arrow-down" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleCreate('clone', record.id)"> 克隆 </el-dropdown-item>
            <el-dropdown-item @click.native="handleExport(record.id)"> 导出 </el-dropdown-item>
            <el-dropdown-item @click.native="handleRelease(record)" v-if="record.status === 'DEVELOPING'"> 发布 </el-dropdown-item>
            <el-dropdown-item @click.native="handleRecall(record, 'recall')" v-if="record.status === 'APPROVED'"> 下架 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </template>
  </AdvanceTable>
</template>

<script>
import { taskStatusFilter } from '@/filters/index'
import sceneMixins from './sceneMixins'
import { getTemplate, removeTemplate, exportTemplate, createTemplate, releaseTemplate, recallTemplate } from 'services/task/task'
export default {
  mixins: [sceneMixins],
  data() {
    return {
      taskStatusFilter,
      loading: false,
      searchConfigs: [
        { label: '模板名称', value: 'name', type: 'Input' },
        { label: '创建', value: 'gmtCreate', type: 'DateRange' },
        { value: 'sceneId', type: 'Const', initValue: '' }

      ],
      columns: [
        { label: '模板名称', prop: 'name', scopedSlots: { customRender: 'name' } },
        { label: '模板状态', prop: 'status', scopedSlots: { customRender: 'status' } },
        { label: '作业场景', prop: 'sceneName', scopedSlots: { customRender: 'sceneName' } },
        { label: '作业数量', prop: 'taskCount' },
        {
          label: '内置模板',
          prop: 'internal',
          customRender(val) {
            return val ? '是' : '否'
          }
        },
        { label: '创建人', prop: 'creator' },
        { label: '最后修改人', prop: 'mender' },
        { label: '创建时间', prop: 'gmtCreate', minWidth: '110px' },
        { label: '修改时间', prop: 'gmtModify', minWidth: '110px' },
        { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
      ],
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  mounted() {
    this.bindImport()
  },
  methods: {
    handleRelease(data) {
      this.$confirm(`您确定要发布该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        releaseTemplate(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleRecall(data) {
      this.$confirm(`您确定要下架该模板【${data.name}】吗?`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        recallTemplate(data.id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    getList() {
      this.loading = true
      getTemplate(this.params)
        .then((data) => {
          if (data.success) {
            this.list = data.data.rows
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearchByScene(sceneId) {
      this.searchConfigs[2].initValue = sceneId;
      this.$refs.tableRef.handleSearch()
    },
    // 对任务进行操作
    handleCreate(type, id) {
      switch (type) {
        case 'create':
          this.$router.push({ name: 'TaskTplCreate' })
          break
        case 'modify':
          this.$router.push({ name: 'TaskTplModify', params: { id } })
          break
        case 'clone':
          this.$router.push({ name: 'TaskTplClone', params: { id } })
          break
      }
    },
    // 删除任务
    handleDelete(id) {
      this.$confirm('您确定要删除该编排模板吗?', '提示', {
        type: 'warning'
      }).then(() => {
        removeTemplate(id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    // 导入任务
    bindImport() {
      const self = this
      // 导入
      document.getElementById('btnTaskUpload').onchange = function (event) {
        const data = event.target.files[0]
        // $('#btnTaskUpload').html($('#btnTaskUpload').html())
        document.getElementById('btnTaskUpload').innerHTML = document.getElementById('btnTaskUpload').innerHTML
        if (data) {
          // 将文件进行转码，转换为text
          const reader = new FileReader()
          reader.readAsText(data)
          reader.onload = function (f) {
            try {
              const data = JSON.parse(this.result)
              createTemplate(data).then((data) => {
                if (data.success) {
                  self.$message({
                    message: data.message,
                    type: 'success'
                  })
                  self.getList()
                }
              })
            } catch (e) {
              self.$message({
                message: '上传文件格式错误',
                type: 'error'
              })
            }
          }
        }
      }
    },
    // 导出任务
    handleExport(id) {
      exportTemplate(id)
    }
  }
}
</script>
