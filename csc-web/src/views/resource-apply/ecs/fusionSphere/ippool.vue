<template>
  <div>
    <basic-form-item label="" class="m-b-lg">
      <!-- <el-button class="m-b" type="primary" size="small"  :disabled="createMode == 'Template'" @click="addNetcard"></el-button> -->
      <el-form-item :label="`网卡${index + 1}：`" v-for="(row, index) in configs.networkCardConfigs" :key="index" label-width="80px">
        <div>
          <!-- <el-button type="danger" @click="netcardRemove(index)" :disabled="createMode == 'Template'" class="el-icon-delete"></el-button> -->
          <el-button type="primary" plain icon="el-icon-edit" @click="netcardModify(index)" class="m-l-xs m-r"></el-button>
          <div style="display: inline-block; width: calc(100% - 140px); vertical-align: top">
            <span class="disk-title">网卡：</span><span class="disk-value">{{ row.portGroupName }}</span> <span class="disk-title">网卡类型：</span><span class="disk-value">{{ row.type | netcardTypeFilter }}</span> <span class="disk-title">IO环大小：</span
            ><span class="disk-value">{{ row.vringbuf }}</span> <span class="disk-title">队列数：</span><span class="disk-value">{{ row.queues }}</span> <span class="disk-title">开启安全组：</span><span class="disk-value">{{ row.enableSecurityGroup | isTrue }}</span>
            <span class="disk-title" v-if="row.enableSecurityGroup">安全组：</span><span class="disk-value" v-if="row.enableSecurityGroup">{{ row.sgroupName }}</span>
          </div>
        </div>
      </el-form-item>
      <!-- <el-row>
        <el-col :span="21" v-for="(cell, index) in configs.networkCardConfigs" :key="index" class="m-b">
          <el-col :span="24">
            <el-select style="width: 200px" v-model="cell.portGroupId">
              <el-option :label="item.portGroupName" :value="item.id" v-for="(item, index) in ipPoolList" :key="index"></el-option>
            </el-select>
          </el-col>
        </el-col>
      </el-row> -->
    </basic-form-item>
    <add-netcard :add-data="netcardData" :portGroupData="ipPoolList" v-if="netcardData.dialog" :vendorId="addData.location.vendorId" @commit="addNetcardCommit"></add-netcard>
  </div>
</template>
<script>
import addNetcard from './addNetcard.vue'
export default {
  components: { addNetcard },
  props: {
    addData: {
      type: Object
    },
    createMode: {
      type: String,
      default: 'Template'
    }
  },
  data() {
    return {
      ipPoolList: [],
      netcardData: {
        dialog: false,
        data: {}
      }
    }
  },
  computed: {
    configs() {
      return this.addData.configs
    },
    count() {
      const {
        nodes = 1,
        emption: { count }
      } = this.addData
      return nodes * count
    },
    networkCards() {
      return this.addData.configs.networkCards
    }
  },
  created() {
    this.getIpPool()
  },
  watch: {
    // 'count' () {
    //   this.configs.networkCardConfigs.map(item => {
    //     this.changePolicy(item)
    //   })
    // },
    'addData.location.vendorId'() {
      this.getIpPool()
    },
    networkCards() {
      this.getIpPool()
    }
  },
  filters: {
    netcardTypeFilter(value) {
      const map = {
        1: 'virtio'
      }
      return map[value]
    }
  },
  methods: {
    // 添加磁盘
    addNetcard() {
      this.netcardData = {
        dialog: true,
        status: 'create',
        cpu: this.addData.cpu,
        data: {
          portGroupId: '',
          type: '1',
          vringbuf: 256,
          queues: 1,
          enableSecurityGroup: false
        }
      }
    },
    addNetcardCommit(data) {
      if (this.netcardData.status == 'create') {
        this.configs.networkCardConfigs.push(data)
      } else {
        const index = this.netcardData.index
        this.configs.networkCardConfigs[index] = data
      }
    },
    netcardRemove(index) {
      this.configs.networkCardConfigs.splice(index, 1)
    },
    netcardModify(index) {
      this.netcardData = {
        dialog: true,
        status: 'update',
        index: index,
        data: JSON.parse(JSON.stringify(this.configs.networkCardConfigs[index]))
      }
    },
    getIpPool() {
      this.ipPoolList = this.addData.networkRelations
      this.configs.networkCardConfigs = []
      if (this.networkCards) {
        for (let index = 0; index < this.networkCards.length; index++) {
          const obj = {
            portGroupId: this.ipPoolList[0].portGroupId,
            portGroupName: this.ipPoolList[0].portGroupName,
            type: '1',
            vringbuf: 256,
            queues: 1,
            enableSecurityGroup: false
          }
          this.configs.networkCardConfigs.push(obj)
        }
      }
    },
    changePolicy(obj, index) {
      obj.address = []
      obj.netmask = []
      if (obj.ipPolicy != 'Manual') return
      for (let index = 0; index < this.count; index++) {
        obj.address.push('')
        obj.netmask.push('')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 100px !important;
}
.disk-title {
  color: #666;
  margin-left: 10px;
  margin-bottom: 10px;
}
.disk-value {
  margin-right: 10px;
}
</style>
