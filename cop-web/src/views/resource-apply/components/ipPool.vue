<template>
  <div>
    <basic-form-item label="网络标签:" validate="required" class="m-b-lg">
      <el-row>
        <el-col :span="18">
          <el-radio-group v-model="configs.portGroupId" @change="getIpPool">
            <el-radio-button :label="item.id" v-for="(item, index) in netPoolList" :key="index">{{item.portGroupName}}</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
    </basic-form-item>
    <basic-form-item label="IP地址池:" validate="required" class="m-b-lg">
      <el-row>
        <el-col :span="18">
          <el-radio-group v-model="configs.ipPoolId">
            <el-radio-button :label="item.id" v-for="(item, index) in ipPoolList" :key="index">{{item.name}}</el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
    </basic-form-item>
  </div>
</template>
<script>
export default {
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
    }
  },
  created() {},
  watch: {
    'addData.location.vendorId'() {
      this.getPool()
    }
  },
  methods: {
    getIpPool() {
      this.ipPoolList = this.netPoolList.find(item => item.id == this.configs.portGroupId).ips
      this.configs.ipPoolId = this.ipPoolList.length ? this.ipPoolList[0].id : ''
    },
    getPool() {
      this.netPoolList = []
      this.addData.networkRelations.map(item => {
        if (this.netPoolList.find(item1 => item1.portGroupName == item.portGroupName)) {
          this.netPoolList.find(item1 => item1.portGroupName == item.portGroupName).ips.push({ name: item.ipPoolName, cidr: item.ipPoolCidr, id: item.ipPoolId })
        } else {
          this.netPoolList.push({ portGroupName: item.portGroupName, id: item.portGroupId, ips: [{ name: item.ipPoolName, cidr: item.ipPoolCidr, id: item.ipPoolId }] })
        }
      })
      this.configs.portGroupId = this.netPoolList[0].id
      this.getIpPool()
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 100px !important;
}
</style>
