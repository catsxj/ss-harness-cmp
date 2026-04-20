<template>
  <div>
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total">
      <template #action>
        <el-button type="primary" @click="toDesigner()">新增</el-button>
      </template>
      <template #status="val">
        <status-icon :type="val | statusFilter('color')">
          {{ val | statusFilter }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="toPreview(record.uuid)">预览</el-button>
        <el-button type="text" @click="toDesigner(record.uuid)" :disabled="record.status">编辑</el-button>
        <!-- <el-button type="text" @click="deleteItem(record.id)" :disabled="record.status">删除</el-button> -->
        <el-dropdown @command="dropdownClick" trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="!record.status" :command="{ fn: 'release', args: { record, bol: true } }"> 发布 </el-dropdown-item>
            <el-dropdown-item v-else :command="{ fn: 'release', args: { record, bol: false } }"> 取消发布 </el-dropdown-item>
            <el-dropdown-item :command="{ fn: 'deleteItem', args: { id: record.id } }" :disabled="record.status"> 删除 </el-dropdown-item>
            <el-dropdown-item :command="{ fn: 'relateMenu', args: { uuid: record.uuid } }" :disabled="!record.status"> 链接 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <full-screen :visible.sync="visible" style="position: fixed">
      <ComponentWrapper :propsUuid="previewId"></ComponentWrapper>
    </full-screen>
    <el-dialog :visible.sync="relatedVisible" title="链接菜单">
      <el-tree :data="treeData" :expand-on-click-node="false" :props="{ label: 'name' }" node-key="id" :default-expanded-keys="[5]" @node-click="clickNode">
        <span class="custom-tree-node" slot-scope="{ node }">
          <div class="custom-tree-node-wrapper">
            <span class="custom-tree-node-label">
              {{ node.label }}
            </span>
          </div>
        </span>
      </el-tree>
      <template #footer>
        <el-button @click="relatedVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { deletePanel, getPanelList, updatePanel, getAuth, modifyAuth } from 'services/reportform/designer.js'
import FullScreen from '../components/fullscreen.vue'
import ComponentWrapper from '../designer/tools/componentWrapper.vue'
import webSocket from '@/common/mixins/getGlobalSocket'

const columns = [
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '标识符',
    prop: 'uuid'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '创建人',
    prop: 'user'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '修改时间',
    prop: 'gmtModify'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  data() {
    return {
      list: [],
      total: 0,
      params: {
        rows: 10,
        page: 1
      },
      columns,
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        {
          type: 'Select',
          value: 'status',
          label: '状态',
          data: [
            { id: true, name: '已发布' },
            { id: false, name: '未发布' }
          ]
        }
      ],
      visible: false,
      previewId: '',
      relatedUuid: '',
      relatedVisible: false,
      treeData: [],
      authData: {},
      winOpen: null
    }
  },
  mixins: [webSocket],
  filters: {
    statusFilter(value, type) {
      const levelData = {
        false: '未发布',
        true: '已发布'
      }
      const colorMap = {
        true: 'success',
        false: 'warning'
      }
      return type == 'color' ? colorMap[value] : levelData[value]
    }
  },
  components: { FullScreen, ComponentWrapper },
  beforeDestroy() {
    window.addEventListener('beforeunload', (e) => this.handleUnload(e))
  },
  methods: {
    getList() {
      getPanelList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    async release({ record, bol }) {
      const { success, message } = await updatePanel({ ...record, status: bol }, record.id)
      if (success) {
        this.$message.success(message)
        this.getList()
      }
    },
    toDesigner(uuid) {
      const { hostname, protocol } = window.location
      const port = 60006
      const url = hostname == 'localhost' ? `/report/designer${uuid ? '?uuid=' + uuid : ''}` : `${protocol}//${hostname}:${port}/sub-app/aos-web/designer${uuid ? '?uuid=' + uuid : ''}`
      if (this.winOpen == null || this.winOpen.closed) {
        this.winOpen = window.open(url, '_blank')
      } else {
        this.winOpen.location.replace(url)
      }
    },
    toPreview(uuid) {
      const { hostname, protocol } = window.location
      const port = 60006
      if (hostname == 'localhost') {
        return window.open(`/report/preview${uuid ? '?uuid=' + uuid : ''}`)
      }
      window.open(`${protocol}//${hostname}:${port}/sub-app/aos-web/preview${uuid ? '?uuid=' + uuid : ''}`, '_blank')
    },
    deleteItem({ id }) {
      this.$confirm('您确定要删除该仪表板吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success, message } = await deletePanel(id)
        if (success) {
          this.$message.success(message)
          this.getList()
        }
      })
    },
    async relateMenu({ uuid }) {
      this.relatedUuid = uuid
      this.relatedVisible = true
      const { data, success } = await getAuth({ parentId: null, tenant: false })
      if (success) {
        this.treeData = data.filter((item) => item.name == '运营分析')
      }
    },
    dropdownClick(data) {
      const { fn, args } = data
      this[fn].call(null, args)
    },
    clickNode(data) {
      console.log(data)
      this.authData = { ...data }
    },
    async confirm() {
      if (!this.authData?.name) {
        return
      }
      this.authData.path = `customreport/${this.relatedUuid}`
      this.authData.component = 'CustomReport'
      const { success } = await modifyAuth(this.authData)
      if (success) {
        this.$message.success('链接成功')
        this.relatedVisible = false
        window.location.reload()
      }
    },
    handleUnload(e) {
      console.log(e)
    },
    onmessage(data) {
      if (data.operate.indexOf('etcd') > -1) {
        this.getList()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dropdown {
  margin-left: 10px;
}
</style>
