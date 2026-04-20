<template>
  <div class="wrapper">
    <!-- list列表 -->
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceFloatIpCreate', params: { type: 'AWS' } }" class="m-l-xs">
          <el-button type="primary">订购浮动IP</el-button>
        </router-link>
      </template>
      <template #tag="tag, record">
        <tag :detail="record" type="FLOATING_IP" @back="getData"></tag>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="edit(record)">编辑</el-button>
        <div class="action-divider"></div>
        <UnsubscribeService :data="record" @getList="getData" type="fip"> </UnsubscribeService>
        <div class="action-divider"></div>
        <el-button type="text" @click="associate(record)" v-if="record.associationId == null || record.associationId == ''">关联</el-button>
        <el-button type="text" @click="disassociation(record)" v-if="record.associationId != null && record.associationId != ''">取消关联</el-button>
      </template>
    </AdvanceTable>
    <!-- 关联ip -->
    <el-dialog title="关联弹性ip地址" width="50%" :close-on-click-modal="false" v-if="associateFlag" :visible.sync="associateFlag">
      <basic-form :model="associateData" status-icon ref="associateData" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <el-col :span="24">
            <!-- 目标宽带 -->
            <basic-form-item label="资源类型：" prop="associateRadio">
              <el-radio-group v-model="associateData.associateRadio" @change="changeAssociateRadio">
                <el-radio :label="0">实例</el-radio>
                <el-radio :label="1">网络接口</el-radio>
              </el-radio-group>
              <p style="border: 1px solid #e6e6e6; padding: 10px"><i class="el-icon-warning" style="color: #e6a23c"></i> 如果您将弹性 IP 地址关联到已关联了弹性 IP 地址的实例，则先前关联的弹性 IP 地址将取消关联，但仍会分配给您的账户。</p>
            </basic-form-item>
          </el-col>
          <template v-if="associateData.associateRadio === 0">
            <el-col :span="24">
              <!-- 实例 -->
              <basic-form-item label="实例：" prop="instanceId" validate="required" required-message="请选择实例">
                <el-select v-model="associateData.instanceId" filterable>
                  <el-option v-for="item in vmData" :key="item.instanceId" :label="item.instanceId" :value="item.instanceId">{{ item.instanceId }}( {{ item.name }} - {{ JSON.parse(item.privateIps).join(',') }} )</el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </template>
          <template v-if="associateData.associateRadio === 1">
            <el-col :span="24">
              <basic-form-item label="网络接口" prop="networkInterfaceId" validate="required" required-message="请选择网络接口">
                <el-select v-model="associateData.networkInterfaceId" filterable>
                  <el-option v-for="item in nicsData" :key="item.networkInterfaceUuid" :label="item.networkInterfaceUuid" :value="item.networkInterfaceUuid"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </template>
          <el-col :span="24">
            <basic-form-item label="重新关联：">
              <el-checkbox v-model="associateData.allowReassociation">允许重新关联此弹性IP地址</el-checkbox>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="cancel('associate')">取消</el-button>
        <el-button type="primary" @click.native="associateSubmit">关联</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑弹性IP" width="50%" :close-on-click-modal="false" v-if="editFlag" :visible.sync="editFlag">
      <el-form :model="editData" status-icon ref="editData" label-width="120px" class="demo-ruleForm">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="editData.name"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="cancel">取消</el-button>
        <el-button type="primary" @click.native="editSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVolume, getElasticips, getNics, patchVmId, detailVm, removeVm, getRes, getVpc, unreleaseElasticips, releaseElasticips, checkElasticips, getVm, associateElasticipsIp, disAssociateElasticipsIp, editElasticipsIp } from 'services/platform/aws'
import UnsubscribeService from '@/components/UnsubscribeService.vue'
import tag from '@/components/tag/index.vue'

export default {
  components: { UnsubscribeService, tag },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: '分配ID', value: 'elasticIpUuid' },
        { type: 'Input', label: 'IP地址', value: 'publicIp' },
        { type: 'Const', value: 'vendorType', initValue: 'AWS' }
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
          label: '关联云主机',
          prop: 'vmName'
        },
        {
          label: '私有IP',
          prop: 'privateIps'
        },
        {
          label: '地址池',
          prop: 'publicIpv4Pool'
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
          label: '操作',
          width: '360px',
          scopedSlots: { customRender: 'operate' },
          disabled: true
        }
      ],
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      tableData: [],
      total: 0,
      vmData: [],
      nicsData: [],
      editFlag: false,
      editData: {
        name: ''
      },
      unreleaseFlag: false,
      // 关联ip验证
      rules2: {
        instanceId: [
          {
            required: true,
            message: '请选择实例',
            trigger: 'blur'
          }
        ]
      },
      // 重装系统
      restSystemData: {
        dialog: false,
        data: {}
      },
      // 调整关联ip显隐
      associateFlag: false,
      // 关联ip
      associateData: {
        associateRadio: 0,
        instanceId: null,
        networkInterfaceId: null,
        allowReassociation: false
      },
      modifyData: {
        dialog: false,
        data: {}
      },
      unattachData: {
        dialog: false,
        data: {}
      },
      modifyPasData: {
        dialog: false,
        data: {}
      },
      attachData: {
        dialog: false,
        data: {},
        flag: true
      }
    }
  },
  methods: {
    getData() {
      this.loading = true
      getElasticips(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 获取云主机list
    getVmData(row) {
      this.params.params = JSON.stringify([
        {
          param: {
            vendorId: row.vendorId
          },
          sign: 'EQ'
        },
        {
          param: {
            regionId: row.regionId
          },
          sign: 'EQ'
        }
      ])
      getVm(this.params).then(data => {
        if (data.success) {
          this.vmData = data.data.rows
        }
      })
    },
    // 获取网络接口list
    getNicsData() {
      getNics(this.params).then(data => {
        if (data.success) {
          this.nicsData = data.data.rows
        }
      })
    },
    // 编辑
    edit(row) {
      this.editFlag = true
      this.editData = row
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
        message: h('div', null, [h('p', null, '如果您释放以下的弹性 IP 地址，则它们将不再分配到您的账户，而您也不能再将其与您的资源关联。'), h('p', null, '弹性IP地址：'), h('ul', null, [h('li', null, `${row.publicIp}`)])]),
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
      this.associateFlag = true
      this.getVmData(row)
      this.getNicsData()
      this.associateId = row.id
      this.associateData.allocationId = row.allocationId
    },
    // 取消关联ip
    disassociation(row) {
      const h = this.$createElement
      this.$msgbox({
        title: '取消关联弹性ip地址',
        message: h('div', null, [
          h(
            'p',
            null,
            '如果您将此弹性 IP 地址取消关联，您可以将它重新关联到其他资源。该弹性 IP 地址仍分配给您的账户。 您可以为运行中的实例免费关联一个弹性 IP (EIP)地址。如果将更多 EIP 与该实例关联，则将按比例向与该实例相关联的每个额外 EIP 收费。额外 EIP 只能在 Amazon VPC 中使用。为确保有效使用弹性 IP 地址，当这些 IP 地址未与运行中的实例相关联或者关联到已停止的实例或未连接的网络接口时，我们会按小时收取少量费用。'
          ),
          h('p', null, '弹性IP地址：'),
          h('ul', null, [h('li', null, `${row.publicIp}`)]),
          h('p', null, [h('p', `${row.instanceId ? '实例ID：' : '网络接口'}`)]),
          h('ul', null, [h('li', null, `${row.instanceId ? row.instanceId : row.networkInterfaceId}`)])
        ]),
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
    },
    // 关联ip
    associateSubmit() {
      this.$refs.associateData.validate(valid => {
        if (!valid) {
          return false
        }
        this.associateData.allowReassociation = String(this.associateData.allowReassociation)
        const sendParam = {
          action: 'association',
          ...this.associateData
        }
        associateElasticipsIp(this.associateId, sendParam).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message({
            type: type,
            message: data.message
          })
          this.resetAssociateForm()
          this.associateFlag = false
          this.getData()
        })
      })
    },
    cancel(type) {
      if (type == 'associate') {
        this.associateFlag = false
        this.resetAssociateForm()
      } else {
        this.editFlag = false
      }
    },
    resetAssociateForm(formName) {
      this.$refs.associateData.resetFields()
      this.associateData.allowReassociation = false
    }
  }
}
</script>

<style lang="scss" scoped></style>
