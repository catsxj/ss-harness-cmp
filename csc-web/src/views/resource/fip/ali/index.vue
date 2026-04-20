<template>
  <div class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceFloatIpCreate', params: { type: 'ALIYUN' } }" class="m-l-xs">
          <el-button type="primary">订购浮动IP</el-button>
        </router-link>
      </template>
      <template #bandwidth="bandwidth"> {{ bandwidth }} Mbps </template>
      <template #tag="tag, record">
        <tag :detail="record" type="FLOATING_IP" @back="getData"></tag>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="edit(record)">编辑</el-button>
        <div class="action-divider"></div>
        <!-- <el-button type="text" @click="release(record)" :disabled="record.instanceName != null">释放</el-button> -->
        <UnsubscribeService :data="record" @getList="getData" type="fip" :disabled="record.instanceName != null"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-button type="text" @click="associate(record)" v-if="record.vmName">关联</el-button>
        <el-button type="text" @click="associate(record)" v-if="record.instanceId == null || record.instanceId == ''">关联</el-button>
        <el-button type="text" @click="disassociation(record)" v-if="record.instanceId != null && record.instanceId != ''">取消关联</el-button>
      </template>
    </AdvanceTable>
    <el-dialog title="编辑弹性IP" width="50%" :close-on-click-modal="false" v-if="editFlag" :visible.sync="editFlag">
      <basic-form :model="editData" status-icon ref="editData" label-width="120px" class="demo-ruleForm">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="editData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="带宽峰值:" prop="bandwidth" validate="required">
              <el-input-number v-model="editData.bandwidth" :min="1" :max="500"></el-input-number>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="editFlag = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit">确定</el-button>
      </div>
    </el-dialog>
    <asso v-if="assoData.dialog" :add-data="assoData" @goBack="getData"></asso>
  </div>
</template>

<script>
import { getElasticips, releaseElasticips, disAssociateElasticipsIp, editElasticipsIp } from 'services/platform/index'
import asso from './dialog/asso.vue'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import tag from '@/components/tag/index.vue'

export default {
  components: { asso, UnsubscribeService, tag },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: '分配ID', value: 'elasticIpUuid' },
        { type: 'Input', label: 'IP地址', value: 'publicIp' },
        { type: 'Const', value: 'vendorType', initValue: 'ALIYUN' }
      ],
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '分配ID',
          prop: 'elasticIpUuid'
        },
        {
          label: 'IP地址',
          prop: 'publicIp'
        },
        {
          label: '实例类型',
          prop: 'instanceType'
        },
        {
          label: '实例名称',
          prop: 'instanceName'
        },
        {
          label: '实例IP',
          prop: 'privateIps'
        },
        {
          label: '带宽',
          prop: 'bandwidth',
          scopedSlots: { customRender: 'bandwidth' }
        },
        {
          label: '标签',
          prop: 'tag',
          scopedSlots: { customRender: 'tag' }
        },
        {
          label: this.$store.getters.systemConfig.serviceConfigLabel,
          prop: 'businessName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '创建者',
          prop: 'creatorName'
        },
        {
          label: '所有者',
          prop: 'ownerName'
        },
        {
          label: '维护者',
          prop: 'menderName'
        },
        {
          label: '所属地域',
          prop: 'regionName'
        },
        {
          label: '资源组',
          prop: 'resourceGroupName'
        },
        {
          label: '操作',
          disabled: true,
          width: '220px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      // 全选
      idList: [],
      selectList: [],
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        regionId: '',
        resourceGroupUuid: ''
      },
      assoData: {
        dialog: false,
        data: {}
      },
      tableData: [],
      total: 0,
      detailFlag: false,
      detail: {},
      editFlag: false,
      editData: {
        name: '',
        bandwidth: 1
      },
      // 调整关联ip显隐
      associateFlag: false,
      // 关联ip
      associateData: {
        instanceId: '',
        allowReassociation: false,
        instanceType: ''
      }
    }
  },
  methods: {
    getData() {
      this.loading = true
      getElasticips(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows.map(item => {
            return {
              ...item
            }
          })
          this.total = data.data.total
        }
      })
    },
    // 编辑
    edit(row) {
      this.editFlag = true
      this.editData = {
        ...row
      }
    },
    editSubmit() {
      this.$refs.editData.validate(valid => {
        if (!valid) {
          return false
        }
        editElasticipsIp(this.editData.id, this.editData).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message({
            type: type,
            message: data.message
          })
          this.editFlag = false
          this.getData()
        })
      })
    },
    // 释放ip
    release(row) {
      const params = JSON.parse(this.params.params)
      const h = this.$createElement
      this.$msgbox({
        title: '释放弹性ip地址',
        message: h('div', null, [h('p', null, '弹性公网IP释放后无法恢复。您确定要释放以下弹性公网IP吗？实例：'), h('p', null, `${row.elasticIpUuid} / ${row.publicIp}`)]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(action => {
        if (action === 'confirm') {
          releaseElasticips(row.id).then(data => {
            const val = data.success ? 'success' : 'error'
            this.$message({
              type: val,
              message: data.message
            })
            this.getData()
          })
        }
      })
    },
    // 关联ip
    associate(row) {
      this.assoData = {
        dialog: true,
        elasticIpUuid: row.elasticIpUuid,
        publicIp: row.publicIp,
        regionId: row.regionId,
        vendorId: row.vendorId,
        associateId: row.id,
        data: {
          instanceId: '',
          allowReassociation: false,
          instanceType: 'EcsInstance'
        }
      }
    },
    // 取消关联ip
    disassociation(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '取消关联弹性ip地址',
        message: h('div', null, [h('p', null, '您确定要解绑该弹性公网IP绑定的资源吗？'), h('p', null, '弹性公网IP实例ID：'), h('ul', null, [h('li', null, `${row.elasticIpUuid}`)]), h('p', null, '实例ID：'), h('ul', null, [h('li', null, `${row.instanceId}`)])]),
        showCancelButton: true,
        confirmButtonText: '取消关联',
        cancelButtonText: '取消'
      }).then(action => {
        if (action === 'confirm') {
          disAssociateElasticipsIp(
            {
              action: 'disassociation'
            },
            row.id
          ).then(data => {
            const val = data.success ? 'success' : 'error'
            this.$message({
              type: val,
              message: data.message
            })
            this.getData()
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
