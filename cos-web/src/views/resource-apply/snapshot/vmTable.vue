<template>
  <div>
    <AdvanceTable :data="list" :columns="columns" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
      <template #ip="val, record">
        <div v-if="record.vendorType == 'OPENSTACK' || record.vendorType == 'EASYSTACK' || record.vendorType == 'MANAGEONE' || record.vendorType == 'FUSIONCLOUD'">
          <span v-for="item in record.privateIpsList" :key="item.networkId">
            <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </span>
        </div>
        <div v-else-if="record.vendorType == 'VMWARE' || record.vendorType == 'INSPURRAIL' || record.vendorType == 'CNWARE' || record.vendorType == 'ZSTACK' || record.vendorType == 'CECSTACK' || record.vendorType == 'H3C' || record.vendorType == 'SANGFOR' || record.vendorType == 'CLOUDTOWER'">
          <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'USPHERE'">
          <div v-for="item in record.privateIpsList" :key="item.address || item.ip">
            <div>{{ item.address || item.ip }}</div>
            <div v-if="item.reserveIp">
              <div v-for="row in item.reserveIp" :key="row.id">{{ row.ip }}</div>
            </div>
          </div>
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
        <div v-else-if="record.vendorType == 'SMARTX'">
          <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
        </div>
        <div v-else-if="record.vendorType == 'SUGONCLOUD'">
          <div v-for="(item, index) in JSON.parse(record.privateIps)" :key="index">
            <div v-if="item.floatingAddress">公网：{{ item.floatingAddress }}</div>
            <div>内网：{{ item.fixedAddress }}</div>
          </div>
          <!-- {{ record.privateIps }} -->
        </div>
        <div v-else>
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
        <div v-if="record.vendorType == 'CNWARE' || record.vendorType == 'CECSTACK'">
          <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item.address }}</div>
        </div>
        <div v-if="record.vendorType == 'USPHERE'">
          <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item ? (index == 0 ? item : `,${item}`) : '' }}</div>
        </div>
      </template>
      <template #disk="val, record">
        <div>
          <div>存储池：{{ record.storName }}</div>
          <div>容量(GiB)：{{ record.systemDiskSize }}</div>
        </div>
      </template>
      <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #os="val, record">
        {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
      </template>
      <template #memory="val"> {{ val }} GB </template>
      <template #vendorName="val, record"> {{ record.vendorType }}-{{ record.vendorName }} </template>
      <template #resourceLabel="val, record">
        <p v-for="(item, index) in JSON.parse(record.resourceLabel)" :key="index">
          <el-tag size="mini" style="margin-right: 5px"> {{ item.key }}:{{ item.value }} </el-tag>
        </p>
      </template>
      <div slot="pagination"></div>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { getVm, getCloudVendor } from 'services/platform/index'
import { getProject } from 'services/system/project'
export default {
  props: {
    addData: {
      type: Object
    },
    itemData: {
      type: Boolean || Object
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: 'IP',
          prop: 'privateIps',
          sortable: 'custom',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: '操作系统',
          prop: 'os',
          scopedSlots: { customRender: 'os' }
        },
        {
          label: '到期时间',
          prop: 'expiredTime'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        }
      ],
      searchConfigs: [
        { label: '虚拟机名称', value: 'name', type: 'Input' },
        { label: 'IP地址', value: 'privateIps', type: 'Input' },
        {
          label: '状态',
          value: 'status',
          type: 'Select',
          data: [
            { id: 'RUNNING', name: '运行中' },
            { id: 'BUILDING', name: '创建中' },
            { id: 'STOPPED', name: '关机' },
            { id: 'SUSPENDED', name: '挂起' },
            { id: 'EXCEPTION', name: '异常' },
            { id: 'UNKNOWN', name: '断开' }
          ]
        },
        { label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', type: 'Select', data: [] },
        {
          label: '所属平台',
          value: 'vendorId',
          type: 'Select',
          data: [],
          service: {
            api: getCloudVendor,
            params: {
              page: 1,
              rows: 9999
            },
            attr: 'data.rows'
          }
        }
      ],
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      idList: [],
      selectList: [],
      loading: false
    }
  },
  methods: {
    // getData() {
    //   getVm(this.params).then((res) => {
    //     if (res.success) {
    //       this.list = res.data.rows
    //       this.total = res.data.total
    //     }
    //   })
    // },
    getProject() {
      getProject({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { queryAsManager: true }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.searchConfigs.forEach((item) => {
            if (item.label === this.$store.getters.systemConfig.projectConfigLabel) {
              item.data = data.data.rows
            }
          })
        }
      })
    },
    selectable(row, index) {
      if ((row.projectVisibility && row.projectVisibility != 'GLOBAL_PROJECT') || (!row.bootFromVolume && row.vendorType == 'OPENSTACK')) {
        return false
      } else {
        return true
      }
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
      this.$emit('setSelectList', this.selectList)
    },
    // 单选
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
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach((item) => {
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
    }
  },
  created() {
    this.getProject()
    if (this.addData) {
      this.list = this.addData.snapshotApplicationParams
    }
  },
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.vm-region {
  height: 42px;
  width: 110px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 10px 0 0;
  border: 1px solid #ddd;
  line-height: 42px;
  font-size: 12px;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-radius: 0;
  display: inline-block;
}

.vm-region:hover {
  border-color: #43bfe3 !important;
}

.vm-region-text {
  border-color: #43bfe3 !important;
}

.region-active {
  background-color: deepskyblue;
  color: #fff;
}
</style>
