<template>
  <el-dialog title="子网标签" :close-on-click-modal="false" :visible.sync="addData.dialog" width="35%">
    <basic-form :model="addData.data" ref="data">
      <basic-form-item label="所属环境：" prop="envCode" validate="required" required-message="请选择环境">
        <el-select v-model="addData.data.envCode" placeholder="请选择">
          <el-option v-for="item in envCodeList" :key="item.id" :label="item.name" :value="item.value"> </el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="网络区域：" prop="networkArea" validate="required" required-message="请输入网络区域名称">
        <el-select v-model="addData.data.networkArea">
          <el-option v-for="(item, index) in dicList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '：'" prop="appSystemCodes" validate="required" :required-message="'请选择' + $store.getters.systemConfig.projectConfigLabel">
        <el-select v-model="addData.data.appSystemCodes" multiple>
          <el-option v-for="(item, index) in appList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="ok">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getEnvironments, detailSoftCategory, setSubnet } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      dicList: [],
      envCodeList: [],
      appList: []
    }
  },
  created() {
    this.getEnvs()
    this.getDics('NETWORK_AREA')
    this.getDics('APP_SYSTEM')
  },
  mounted() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (!valid) {
          return false
        }
        const names = []
        this.addData.data.appSystemCodes.forEach(data => {
          const obj = this.appList.find(item => item.value === data)
          names.push(obj.name)
        })
        // const app = this.appList.find((item) => item.value === this.addData.data.appSystemCode)
        // console.log(app)
        // this.addData.data.appSystemName = app.name
        const appSystemCode = this.addData.data.appSystemCodes.join(',')
        const appSystemName = names.join(',')
        setSubnet(this.addData.id, {
          id: this.addData.id,
          params: JSON.stringify({
            labels: { ...this.addData.data, appSystemCode, appSystemName }
          })
        }).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message({
            type: type,
            message: data.message
          })
          if (data.success) {
            this.$refs.data.resetFields()
            this.addData.dialog = false
            this.$emit('back')
          }
        })
      })
    },
    getEnvs() {
      getEnvironments({
        simple: true
      }).then(data => {
        if (data.success) {
          this.envCodeList = data.data.rows
        }
      })
    },
    getDics(val) {
      let name
      if (val === 'APP_SYSTEM') name = 'appList'
      if (val === 'NETWORK_AREA') name = 'dicList'
      detailSoftCategory(val).then(data => {
        if (data.success) {
          this[name] = data.data
        }
      })
    }
  }
}
</script>
