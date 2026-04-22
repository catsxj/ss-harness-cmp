<template>
  <div>
    <basic-form-item label="网卡：" class="m-b-lg">
      <el-row>
        <el-col :span="21" v-for="(cell, index) in configs.networkCardConfigs" :key="index" class="m-b">
          <el-col :span="24">
            <el-select style="width: 200px" v-model="cell.portGroupId" @change="setIpList(cell)">
              <el-option :label="item.portGroupName" :value="item.id" v-for="(item, index) in ipPoolList" :key="index"></el-option>
            </el-select>
            <el-select style="width: 200px" class="m-l-md" v-model="cell.ipPoolId" @change="getIp(cell)">
              <el-option :label="item.name" :value="item.id" v-for="(item, index) in cell.ippools" :key="index"></el-option>
            </el-select>
            <el-radio-group class="m-l-md" v-model="cell.ipPolicy" size="small" @change="getIp(cell)">
              <el-radio-button label="Auto">自动</el-radio-button>
              <el-radio-button label="Dhcp">DHCP</el-radio-button>
              <el-radio-button label="Manual">手动</el-radio-button>
            </el-radio-group>
            <el-button class="m-l-md" type="text" v-if="cell.ipPolicy === 'Manual' && cell.ipPolicy" @click="assignIp(cell, cell.ippools.find(item => item.id == cell.ipPoolId), index)">分配IP</el-button>
          </el-col>
          <el-col :span="24" class="m-t-sm" v-if="needIpV6">
            <el-checkbox v-model="cell.checkIpv6">是否启用IPV6</el-checkbox>
            <el-select style="width: 200px" class="m-l-md" v-model="cell.ipv6PoolId" @change="getIpV6(cell)" v-if="cell.checkIpv6">
              <el-option :label="item.name" :value="item.id" v-for="(item, index) in cell.ipv6pools" :key="index"></el-option>
            </el-select>
            <el-radio-group class="m-l-md" v-model="cell.ipv6Policy" size="small" @change="getIpV6(cell)" v-if="cell.checkIpv6">
              <el-radio-button label="Auto">自动</el-radio-button>
              <el-radio-button label="Dhcp">DHCP</el-radio-button>
              <el-radio-button label="Manual">手动</el-radio-button>
            </el-radio-group>
            <el-button class="m-l-md" type="text" v-if="cell.ipv6Policy === 'Manual' && cell.ipv6PoolId && cell.checkIpv6" @click="assignIp(cell, cell.ipv6pools.find(item => item.id == cell.ipv6PoolId), index)">分配IP</el-button>
          </el-col>
        </el-col>
      </el-row>
    </basic-form-item>
    <assign :dialog="dialog" v-if="dialog.dialog" @back="setAddress"></assign>
  </div>
</template>
<script>
import { conditionIp } from 'services/platform/index'
import assign from './assignIp.vue'
export default {
  components: { assign },
  props: {
    addData: {
      type: Object
    },
    needIpV6: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ipPools: {},
      netPoolList: [],
      ipPoolList: [],
      dialog: {
        dialog: false
      }
    }
  },
  computed: {
    configs () {
      return this.addData.configs
    },
    count() {
      const { nodes = 1, emption: { count } } = this.addData;
      return nodes * count;
    }
  },
  created () {
    this.getIpPool()
  },
  watch: {
    'count' () {
      this.configs.networkCardConfigs.map(item => {
        this.getIp(item)
        if (item.checkIpv6) this.getIpV6(item)
      })
    },
    'addData.location.vendorId' () {
      this.getIpPool()
    }
  },
  methods: {
    setIpList (cell) {
      const ippools = []
      const ipv6pools = []
      this.ipPoolList.find(item => item.id == cell.portGroupId).ips.forEach(item => {
        if (item.version == 'V4') ippools.push(item)
        if (item.version == 'V6') ipv6pools.push(item)
      })
      this.$set(cell, 'ippools', ippools)
      this.$set(cell, 'ipv6pools', ipv6pools)
    },
    setAddress (data) {
      if (data.version == 'V4') {
        this.configs.networkCardConfigs[data.index].address = data.address
      } else {
        this.configs.networkCardConfigs[data.index].ipv6Address = data.address
      }
    },
    assignIp (data, obj, index) {
      this.dialog = {
        dialog: true,
        version: obj.version,
        address: obj.version == 'V4' ? data.address : data.ipv6Address,
        index: index,
        poolId: obj.version == 'V4' ? data.ipPoolId : data.ipv6PoolId
      }
    },
    getIp (obj) {
      if (obj.ipPolicy != 'Manual') return;
      obj.address = []
      conditionIp({
        condition: JSON.stringify({
          condition: 'preAllocation',
          poolId: obj.ipPoolId,
          count: this.count
        })
      }).then(data => {
        if (data.success) {
          obj.address = data.data.map(item => {
            return item.ip
          })
        }
      })
    },
    getIpV6 (obj) {
      if (obj.ipv6Policy != 'Manual') return;
      obj.ipv6Address = []
      conditionIp({
        condition: JSON.stringify({
          condition: 'preAllocation',
          poolId: obj.ipv6PoolId,
          count: this.count
        })
      }).then(data => {
        if (data.success) {
          obj.ipv6Address = data.data.map(item => {
            return item.ip
          })
        }
      })
    },
    getIpPool () {
      this.ipPoolList = []
      this.addData.networkRelations.map(item => {
        if (this.ipPoolList.find(item1 => item1.portGroupName == item.portGroupName)) {
          this.ipPoolList.find(item1 => item1.portGroupName == item.portGroupName).ips.push({ name: item.ipPoolName, cidr: item.ipPoolCidr, id: item.ipPoolId, version: item.version })
        } else {
          this.ipPoolList.push({ portGroupName: item.portGroupName, id: item.portGroupId, ips: [{ name: item.ipPoolName, cidr: item.ipPoolCidr, id: item.ipPoolId, version: item.version }] })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 100px !important;
}
.add-border{
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
