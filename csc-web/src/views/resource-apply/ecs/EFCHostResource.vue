<template>
  <el-dialog title="资源查看" :visible.sync="addData.visible" width="1200px" append-to-body :close-on-click-modal="false">
    <AdvanceTable :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #ip="val, record">
        <div v-if="record.vendorType == 'OPENSTACK' || record.vendorType == 'EASYSTACK' || record.vendorType == 'MANAGEONE' || record.vendorType == 'FUSIONCLOUD'">
          <span v-for="item in record.privateIpsList" :key="item.networkId">
            <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </span>
        </div>
        <div v-else-if="record.vendorType == 'VMWARE' || record.vendorType == 'INSPURRAIL' || record.vendorType == 'CNWARE' || record.vendorType == 'ZSTACK' || record.vendorType == 'CECSTACK' || record.vendorType == 'H3C' || record.vendorType == 'SANGFOR' || record.vendorType == 'CLOUDTOWER'">
          <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'HUAWEI' || record.vendorType == 'HCSO'">
          <div v-for="item in record.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'QCLOUD'">
          <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.address }}</div>
        </div>
        <div v-else-if="record.vendorType == 'AZURE' || record.vendorType == 'AWS'">
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-else-if="record.vendorType == 'JDCLOUD'">
          <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item }}</div>
        </div>
        <div v-else-if="record.vendorType == 'VOLCENGINE'">
          <!-- <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
          <div v-if="JSON.parse(record.privateIps)[0].primaryIpAddress">{{ JSON.parse(record.privateIps)[0].primaryIpAddress }}(内网)</div>
          <div v-if="JSON.parse(record.privateIps)[0].eipAddress">{{ JSON.parse(record.privateIps)[0].eipAddress }}(公网)</div>
        </div>
        <div v-else-if="record.vendorType == 'USPHERE'">
          <div v-for="item in record.privateIpsList" :key="item.address || item.ip">
            <div>{{ item.address || item.ip }}</div>
            <div v-if="item.reserveIp">
              <div v-for="row in item.reserveIp" :key="row.id">{{ row.ip }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="record.vendorType == 'SMARTX'">
          <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
        </div>
        <div v-else>
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
        <div v-if="record.vendorType == 'CNWARE' || record.vendorType == 'CECSTACK'">
          <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item.address }}</div>
        </div>
      </template>
      <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
    </AdvanceTable>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click.native="addData.visible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { conditionPoolQueryByType } from 'services/platform/pool'
import { conditionProject } from 'services/system/project'
import store from '@/store'
export default {
  name: 'EFCHostResource',
  props: {
    addData: {
      type: Object,
      default: () => ({
        visible: false,
        poolGroupId: '',
        vendorId: ''
      })
    }
  },
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'isTemplate', initValue: false },
        { type: 'Const', value: 'vendorId', initValue: this.addData.vendorId },
        {
          type: 'Select',
          label: store.getters.systemConfig.projectConfigLabel,
          value: 'projectId',
          data: [],
          service: {
            api: conditionProject,
            params: {
              condition: JSON.stringify({
                condition: 'listApplyProjects'
              })
            },
            attr: 'data'
          }
        },
        {
          type: 'Select',
          label: '宿主机',
          value: 'hostId',
          data: [],
          service: {
            api: conditionPoolQueryByType,
            params: {
              type: 'Host',
              poolGroupId: this.addData.poolGroupId
            },
            attr: 'data'
          }
        }
      ],
      params: {
        page: 1,
        rows: 10
      },
      columns: [
        {
          label: '宿主机',
          prop: 'hostName'
        },
        {
          label: '云主机名称',
          prop: 'name'
        },
        {
          label: 'IP',
          prop: 'privateIps',
          sortable: 'custom',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        }
      ],
      list: [],
      total: 0,
      loading: false
    }
  },
  methods: {
    getList() {
      this.loading = true
      conditionPoolQueryByType({
        ...this.params,
        type: 'Server',
        poolGroupId: this.addData.poolGroupId
      })
        .then(data => {
          if (data.success) {
            this.list = data.data.rows.map(item => {
              if (item.vendorType === 'SANGFOR' && item.privateIps) {
                item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
              }
              if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
              if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
              return item
            })
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
