<template>
  <div>
    <basic-table :data="itemData.cancelationParams">
      <el-table-column label="名称" show-overflow-tooltip prop="resourceConfig.name"> </el-table-column>
      <el-table-column label="IP" prop="" show-overflow-tooltip>
        <template slot-scope="scope">
          <div v-if="scope.row.resourceConfig.vendorType == 'OPENSTACK' || scope.row.resourceConfig.vendorType == 'EASYSTACK' || scope.row.resourceConfig.vendorType == 'MANAGEONE' || scope.row.resourceConfig.vendorType == 'FUSIONCLOUD'">
            <span v-for="item in scope.row.resourceConfig.privateIpsList" :key="item.networkId">
              <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </span>
          </div>
          <div
            v-else-if="
              scope.row.resourceConfig.vendorType == 'VMWARE' ||
              scope.row.resourceConfig.vendorType == 'INSPURRAIL' ||
              scope.row.resourceConfig.vendorType == 'CNWARE' ||
              scope.row.resourceConfig.vendorType == 'ZSTACK' ||
              scope.row.resourceConfig.vendorType == 'CECSTACK' ||
              scope.row.resourceConfig.vendorType == 'H3C'
            "
          >
            <div v-for="item in scope.row.resourceConfig.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'HUAWEI' || scope.row.resourceConfig.vendorType == 'HCSO'">
            <div v-for="item in scope.row.resourceConfig.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'QCLOUD'">
            <div v-for="(item, index) in scope.row.resourceConfig.privateIpsList" :key="index">(内网){{ item.address }}</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'AZURE' || scope.row.resourceConfig.vendorType == 'AWS'">
            <div v-for="item in scope.row.resourceConfig.privateIpsList" :key="item">(内网){{ item }}</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'JDCLOUD'">
            <div v-for="(item, index) in scope.row.resourceConfig.privateIpsList" :key="index">(内网){{ item }}</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'VOLCENGINE'">
            <!-- <div v-for="(item, index) in scope.row.resourceConfig.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
            <div v-if="JSON.parse(scope.row.resourceConfig.privateIps)[0].primaryIpAddress">{{ JSON.parse(scope.row.resourceConfig.privateIps)[0].primaryIpAddress }}(内网)</div>
            <div v-if="JSON.parse(scope.row.resourceConfig.privateIps)[0].eipAddress">{{ JSON.parse(scope.row.resourceConfig.privateIps)[0].eipAddress }}(公网)</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'SMARTX' || scope.row.resourceConfig.vendorType == 'CLOUDTOWER'">
            <div>{{ scope.row.resourceConfig.managerIp ? '(内网)' + scope.row.resourceConfig.managerIp : '--' }}</div>
          </div>
          <div v-else-if="scope.row.resourceConfig.vendorType == 'SANGFOR'">
            <div>{{ scope.row.resourceConfig.privateIps }}</div>
          </div>
          <div v-else>
            <div v-for="item in scope.row.resourceConfig.privateIpsList" :key="item">(内网){{ item }}</div>
          </div>
          <div v-if="scope.row.resourceConfig.floatingIp">(公网){{ scope.row.resourceConfig.floatingIp }}</div>
          <div v-if="scope.row.resourceConfig.vendorType == 'CNWARE' || scope.row.resourceConfig.vendorType == 'CECSTACK'">
            <div v-for="(item, index) in scope.row.resourceConfig.publicIps" :key="index">(公网){{ item.address }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="UUID" show-overflow-tooltip prop="resourceConfig.sn"> </el-table-column>
      <el-table-column label="配置" show-overflow-tooltip prop="resourceConfig.spec"> </el-table-column>
      <el-table-column label="订购产品" prop="resourceConfig.type" show-overflow-tooltip> </el-table-column>
      <el-table-column label="移入时间" prop="resourceConfig.gmtCreate" show-overflow-tooltip> </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </div>
</template>
<script>
import { computed, defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    itemData: {
      type: Array
    }
  },
  setup(props) {
    // const preview = computed(() => {
    //   if (typeof props.itemData.preview === 'string') {
    //     return JSON.parse(props.itemData.preview)
    //   }
    //   return props.itemData.preview
    // })
    // return {
    //   preview
    // }
  }
})
</script>
