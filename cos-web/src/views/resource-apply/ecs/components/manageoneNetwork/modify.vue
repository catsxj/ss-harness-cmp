<template>
  <div>
    <el-dialog title="编辑网卡" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog" append-to-body>
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="指定IP：">
            <el-switch v-model="addData.data.switch" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="addData.version == 'V4' && addData.data.switch" prop="ip" validate="required,ip">
            <el-input v-model="addData.data.ip" placeholder="1.1.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="addData.version == 'V6' && addData.data.switch" prop="ip" validate="required,ipV6">
            <el-input v-model="addData.data.ip" placeholder="2222::"></el-input>
          </basic-form-item>
          <basic-form-item label="IP范围：" v-if="addData.data.switch && ippools">
            <div v-for="(item, index) in ippools" :key="index">
              {{ item }}
            </div>
          </basic-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    },
    networkList: {
      type: Array
    }
  },
  data() {
    return {
      ippools: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          this.$emit('modify', this.addData)
          this.addData.dialog = false
        }
      })
    }
  },
  created() {
    this.ippools = this.addData.ipPools ? JSON.parse(this.addData.ipPools) : []
  }
}
</script>

<style></style>
