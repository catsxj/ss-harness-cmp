<template>
  <div>
    <el-dialog title="新增端口" append-to-body :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <basic-form-item label="端口名称：" prop="name" validate="required,noChinese">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
          <basic-form-item label="子网名称：" prop="subnetId" validate="required">
            <el-select v-model="addData.data.subnetId" @change="setVersion" filterable>
              <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="指定IP：" v-if="addData.data.subnetId">
            <el-switch v-model="addData.data.switch" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="version == 'V4' && addData.data.switch && addData.data.subnetId" prop="ipAddress" validate="required,ip">
            <el-input v-model="addData.data.ipAddress" placeholder="1.1.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="version == 'V6' && addData.data.switch && addData.data.subnetId" prop="ipAddress" validate="required,ipV6">
            <el-input v-model="addData.data.ipAddress" placeholder="2222::"></el-input>
          </basic-form-item>
          <basic-form-item label="IP范围：" v-if="addData.data.subnetId && addData.data.switch && ippools">
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
/* global $ */
import { getSubnet, createPort } from 'services/platform/index'
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
    }
  },
  data() {
    return {
      subnetList: [],
      version: 'V4',
      ipPools: []
    }
  },
  methods: {
    setVersion() {
      this.subnetList.forEach(item => {
        if (item.id == this.addData.data.subnetId) {
          this.version = item.ipVersion
          this.ippools = item.ipPools ? JSON.parse(item.ipPools) : []
          this.$set(this.addData.data, 'switch', false)
          this.$set(this.addData.data, 'ipAddress', '')
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createPort(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        }
      })
    }
  },
  created() {
    const params = {}
    const searchParam = [{ param: { vendorId: this.addData.data.vendorId, networkId: this.addData.data.networkId }, sign: 'EQ' }]
    params.params = JSON.stringify(searchParam)
    getSubnet(params).then(data => {
      if (data.success) {
        this.subnetList = data.data.rows
      }
    })
  }
}
</script>

<style scoped>
.btn-checkbox:hover {
  background-color: #5ac1f5;
  color: #fff;
}

.btn {
  width: 90%;
  margin-right: 3%;
  display: inline-block;
  border: 1px solid #5ac1f5;
  color: #5ac1f5;
  margin-bottom: 5px;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-ok {
  background: #5ac1f5 !important;
  color: #fff !important;
}

.ip-input {
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
</style>
