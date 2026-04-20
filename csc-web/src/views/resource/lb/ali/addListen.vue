<template>
  <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="80%">
    <balancer-item ref="balancerItem" :vendor-id="addData.vendorId" :region-id="addData.regionId" :lb-id="addData.lbId" @next="recursion" :add-data="addData"></balancer-item>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" v-if="active >= 1" @click="next(2)">上一步</el-button>
      <el-button type="ghost" v-if="active <= 1" @click="next(1)">下一步</el-button>
      <el-button type="primary" v-if="active == 2" @click="ok">确定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import balancerItem from './balancerItem.vue'
import { createLbListen, modifyLbListen } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  components: { balancerItem },
  data() {
    return {
      active: 0
    }
  },
  created() {},
  mounted() {},
  methods: {
    recursion(data) {
      this.active = data
    },
    next(index) {
      this.$refs.balancerItem.next(index)
    },
    async ok() {
      const data = await this.$refs.balancerItem.getPostData()
      if (!data) return
      console.log(this.addData)
      if (this.addData.id) {
        modifyLbListen({
          id: this.addData.id,
          vendorId: this.addData.vendorId,
          // lbPool: this.addData.data.lbPool, //接口数据，待定
          configuration: data
        }).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message[type](data.message)
          if (data.success) {
            this.addData.dialog = false
          }
        })
      } else {
        createLbListen({
          listener: {
            lbId: this.addData.lbId,
            vendorId: this.addData.vendorId,
            // lbPool: this.addData.data.lbPool, //接口数据，待定
            configuration: data
          }
        }).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message[type](data.message)
          if (data.success) {
            this.addData.dialog = false
          }
        })
      }
    }
  }
}
</script>
