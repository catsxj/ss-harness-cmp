<template>
  <div>
    <div v-if="!detailFlag">
      <AdvanceTable title="告警模板列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll" ref="thresholdTable">
        <template v-slot:action>
          <el-button type="primary" @click="handleCreate()">
            <i class="el-icon-plus"></i>
            新增
          </el-button>
          <el-button type="ghost" @click="handleBatchDelete" :disabled="!selectList.length">
            <i class="el-icon-delete"></i>
            删除
          </el-button>
        </template>
        <!-- <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{val}}</span>
      </template> -->
        <template #resourceType="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ resourceTypeMonitorFilter(val) }}</span>
        </template>
        <template #isGlobal="isGlobal">
          {{ isGlobal ? '全局' : '自定义' }}
        </template>
        <template #enable="val">
          <status-icon :type="val ? 'success' : 'danger'">{{ val ? '开启' : '关闭' }} </status-icon>
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="handleCreate(record)">编辑</el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="handleDelete(record.id)">删除</el-button>
        </template>
      </AdvanceTable>
    </div>
    <el-dialog :title="titleMap[status]" v-if="addFlag" :visible.sync="addFlag" :close-on-click-modal="false">
      <div :style="`height: calc(55vh);overflow-y:auto`">
        <basic-form ref="addData" :model="addData" label-width="130px">
          <basic-form-item label="资源类型：" prop="resourceType" validate="required">
            <el-select filterable clearable v-model="addData.resourceType">
              <el-option v-for="item in resourceList" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="站内信发送模板:" prop="message">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.message"></el-input>
          </basic-form-item>
          <basic-form-item label="站内信恢复模板:" prop="messageRecovery">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.messageRecovery"></el-input>
          </basic-form-item>
          <basic-form-item label="邮件发送模板:" prop="email">
            <RichEditor :value="addData.email"></RichEditor>
          </basic-form-item>
          <basic-form-item label="邮件恢复模板:" prop="emailRecovery">
            <RichEditor :value="addData.emailRecovery"></RichEditor>
          </basic-form-item>
          <basic-form-item label="企业微信发送模板:" prop="weixin">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.weixin"></el-input>
          </basic-form-item>
          <basic-form-item label="企业微信恢复模板:" prop="weixinRecovery">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.weixinRecovery"></el-input>
          </basic-form-item>
          <basic-form-item label="钉钉发送模板:" prop="dingding">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.dingding"></el-input>
          </basic-form-item>
          <basic-form-item label="钉钉恢复模板:" prop="dingdingRecovery">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" v-model="addData.dingdingRecovery"></el-input>
          </basic-form-item>
        </basic-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取 消</el-button>
        <el-button type="primary" @click.native="addSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="资源类型">{{ resourceTypeMonitorFilter(detailData.resourceType) }}</common-detail-item>
        <common-detail-item label="创建人">{{ detailData.createName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <!-- <common-detail-item label="邮件发送模板">{{detailData.email}}</common-detail-item>
        <common-detail-item label="邮件恢复模板">{{detailData.emailRecovery}}</common-detail-item>
        <common-detail-item label="企业微信发送模板">{{detailData.weixin}}</common-detail-item>
        <common-detail-item label="企业微信恢复模板">{{detailData.weixinRecovery}}</common-detail-item>
        <common-detail-item label="钉钉发送模板">{{detailData.dingding}}</common-detail-item>
        <common-detail-item label="钉钉恢复模板">{{detailData.dingdingRecovery}}</common-detail-item>
        <common-detail-item label="站内信发送模板">{{detailData.message}}</common-detail-item>
        <common-detail-item label="站内信恢复模板">{{detailData.messageRecovery}}</common-detail-item> -->
      </template>
      <div>
        <basic-form :model="detailData" label-width="130px">
          <basic-form-item label="邮件发送模板:" prop="email">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.email"></el-input>
          </basic-form-item>
          <basic-form-item label="邮件恢复模板:" prop="emailRecovery">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.emailRecovery"></el-input>
          </basic-form-item>
          <basic-form-item label="企业微信发送模板:" prop="weixin">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.weixin"></el-input>
          </basic-form-item>
          <basic-form-item label="企业微信恢复模板:" prop="weixinRecovery">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.weixinRecovery"></el-input>
          </basic-form-item>
          <basic-form-item label="钉钉发送模板:" prop="dingding">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.dingding"></el-input>
          </basic-form-item>
          <basic-form-item label="钉钉恢复模板:" prop="dingdingRecovery">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.dingdingRecovery"></el-input>
          </basic-form-item>
          <basic-form-item label="站内信发送模板:" prop="message">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.message"></el-input>
          </basic-form-item>
          <basic-form-item label="站内信恢复模板:" prop="messageRecovery">
            <el-input type="textarea" readonly :autosize="{ minRows: 3, maxRows: 6 }" v-model="detailData.messageRecovery"></el-input>
          </basic-form-item>
        </basic-form>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { resourceTypeMonitorFilter } from '@/filters/index'
import { getTempList, createTemp, modifyTemp, removeTemp, batchRemoveTemp } from 'services/monitor/index.js'
import RichEditor from 'components/rich-text-editor/index.vue'
import { getResourceList } from 'services/platform/index'
const columns = [
  {
    type: 'selection',
    disabled: true
  },
  // {
  //   label: '名称',
  //   prop: 'name',
  //   scopedSlots: { customRender: 'name' }
  // },
  {
    label: '资源类型',
    prop: 'resourceType',
    scopedSlots: { customRender: 'resourceType' }
  },
  {
    label: '创建人',
    prop: 'createName'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  // {
  //   label: '描述',
  //   prop: 'remark'
  // },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    RichEditor
  },
  data() {
    return {
      resourceTypeMonitorFilter,
      columns,
      resourceList: [],
      searchConfigs: [
        // { type: 'Input', label: '名称', value: 'name' },
        { type: 'Select', label: '资源类型', value: 'resourceType', data: [], props: { value: 'value' } }
        // { type: 'Const', value: 'vendorId', initValue: this.platformObject.vendorId }
      ],
      loading: false,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {},
      titleMap: {
        create: '新增告警模板',
        update: '编辑告警模板'
      },
      status: 'create',
      addFlag: false,
      addData: {}
    }
  },
  created() {
    getResourceList().then(({ data, success }) => {
      if (success) {
        this.searchConfigs[0].data = data.rows.map((item) => ({ ...item, value: item.resourceType }))
        this.resourceList = data.rows.map((item) => ({ ...item, value: item.resourceType }))
      }
    })
  },
  methods: {
    getList() {
      this.loading = true
      this.refreshId()
      getTempList(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((item) => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.thresholdTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    handleCreate(data) {
      if (data) {
        this.status = 'update'
        this.$router.push({ name: 'ModifyMonitorTemplate', query: { id: data.id } })
      } else {
        this.status = 'create'
        this.$router.push({ name: 'CreateMonitorTemplate', query: {} })
      }
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const http = this.status == 'create' ? createTemp : modifyTemp
          http(this.addData).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.addFlag = false
              this.getList()
            }
          })
        }
      })
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该告警模板吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeTemp(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    handleBatchDelete() {
      this.refreshId()
      this.$confirm('您确定要批量删除选择告警模板吗?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          batchRemoveTemp({
            ids: this.idList
          }).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.selectList = []
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    getDetail(row) {
      this.detailData = Object.assign({}, row)
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
<style scoped></style>
