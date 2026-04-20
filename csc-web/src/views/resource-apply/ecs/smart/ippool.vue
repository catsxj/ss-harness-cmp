<template>
  <div>
    <basic-form-item label="网卡：" class="m-b-lg">
      <el-row>
        <el-col :span="21" v-for="(cell, index) in configs.networkCardConfigs" :key="index" class="m-b">
          <el-col :span="24">
            <el-select style="width: 200px" v-model="cell.portGroupId">
              <el-option :label="item.portGroupName" :value="item.id" v-for="(item, index) in ipPoolList" :key="index"></el-option>
            </el-select>
            <el-radio-group class="m-l-md" v-model="cell.ipPolicy" size="small" @change="changePolicy(cell, index)">
              <el-radio-button label="Auto">默认</el-radio-button>
              <el-radio-button label="Dhcp">DHCP</el-radio-button>
              <el-radio-button label="Manual">手动</el-radio-button>
            </el-radio-group>
            <div v-if="cell.ipPolicy == 'Manual'">
              <basic-form ref="data" :model="cell" :status-icon="true" label-width="0px">
                <div v-for="(item, index) in cell.address" :key="index" class="m-t-md">
                  <el-col :span="24">
                    <el-col :span="4">
                      <basic-form-item label="" :prop="'address.' + index" validate="required,ip">
                        <el-input v-model="cell.address[index]" placeholder="IP"></el-input>
                      </basic-form-item>
                    </el-col>
                    <el-col :span="4" class="m-l">
                      <basic-form-item label="" :prop="'netmask.' + index" validate="mask">
                        <el-input v-model="cell.netmask[index]" placeholder="子网掩码"></el-input>
                      </basic-form-item>
                    </el-col>
                  </el-col>
                </div>
              </basic-form>
            </div>
          </el-col>
        </el-col>
      </el-row>
    </basic-form-item>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      ipPools: {},
      netPoolList: [],
      ipPoolList: []
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
    }
  },
  created() {
    this.getIpPool()
  },
  watch: {
    count() {
      this.configs.networkCardConfigs.map(item => {
        this.changePolicy(item)
      })
    },
    'addData.location.vendorId'() {
      this.getIpPool()
    }
  },
  methods: {
    getIpPool() {
      this.ipPoolList = this.addData.networkRelations
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
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
