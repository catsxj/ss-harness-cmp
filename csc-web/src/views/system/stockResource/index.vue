<template>
  <div>
    <AdvanceTable title="资源认领" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="handleSelectionChange">
      <template v-slot:action>
        <el-button type="primary" @click="handleOpenDialog()" :disabled="!selectionIds.length">批量申领</el-button>
      </template>
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
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #os="val, record">
        <div v-if="record.vendorType == 'SMARTX' || record.vendorType == 'ZSTACK'">
          {{ record.osVersion ? record.osVersion : '' }}
        </div>
        <div v-else>
          {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
        </div>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleOpenDialog(record)">申领</el-button>
      </template>
    </AdvanceTable>
    <AddDialog :dialog="addDialog" v-if="addDialog.visible"></AddDialog>
  </div>
</template>
<script>
import AddDialog from './AddDialog.vue'
import { columns, searchConfigs as searchConfig } from './config'
import { defineComponent, ref } from '@vue/composition-api'
import useTable from 'hooks/useTable.ts'
import useSelection from 'hooks/useSelection.ts'
import { getVm, conditionServiceNew } from 'services/platform/index.js'
import { vendorName } from 'filters/common'
import useWebsocket from 'hooks/useWebsocket'
export default {
  name: 'stockResource',
  components: { AddDialog },
  setup(props, context) {
    useWebsocket(data => {
      if (data.operate === 'resource.pick') {
        getList()
      }
    })
    const searchConfigs = ref(searchConfig)
    conditionServiceNew({
      condition: JSON.stringify({
        condition: 'getServiceType',
        catalog: 'server'
      })
    }).then(res => {
      searchConfigs.value.map(i => {
        if (i.label === '平台类型') {
          i.data = res.data.map(_ => {
            return {
              id: _,
              name: vendorName(_)
            }
          })
        }
      })
    })

    const { list, total, params, loading, getList } = useTable({
      getService: getVm,
      listFormat(rows) {
        return rows.map(item => {
          if (item.vendorType === 'SANGFOR' && item.privateIps) {
            item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
          }
          if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
          if (item.publicIps) item.publicIpsList = JSON.parse(item.publicIps)
          return item
        })
      }
    })

    // 创建
    const addDialog = ref({
      visible: false,
      ids: {}
    })

    const { selectionIds, handleSelectionChange } = useSelection()

    const handleOpenDialog = record => {
      const ids = record ? [record.id] : selectionIds
      addDialog.value.visible = true
      addDialog.value.ids = ids
    }
    return {
      columns,
      searchConfigs,
      loading,
      list,
      total,
      params,
      addDialog,
      getList,
      selectionIds,
      handleSelectionChange,
      handleOpenDialog
    }
  }
}
</script>
