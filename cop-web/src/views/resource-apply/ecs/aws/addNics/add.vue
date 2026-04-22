<template>
  <div>
    <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog" append-to-body>
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <!-- <basic-form-item label="deviceIndex：" prop="deviceIndex" validate = "required">
            <el-input v-model="addData.data.deviceIndex"></el-input>
          </basic-form-item> -->
          <basic-form-item label="网络接口：" prop="networkInterfaceUuid" validate="required">
            <el-select v-model="addData.data.networkInterfaceUuid">
              <el-option v-for="item in list" :disabled="nowList.indexOf(item.networkInterfaceUuid) > -1" :label="item.name + '(类型：' + item.interfaceType + ')'" :value="item.networkInterfaceUuid" :key="item.value"></el-option>
            </el-select>
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
import { getNics } from 'services/platform/aws'
export default {
  props: {
    addData: {
      type: Object,
      default: function() {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    },
    subnetId: {
      type: [String, Number]
    },
    vendorId: {
      type: [String, Number]
    },
    nowList: {
      type: Array
    }
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    getNics() {
      getNics({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.vendorId, subnetId: this.subnetId, deviceIndex: -1 }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.list.forEach(item => {
            if (item.networkInterfaceUuid == this.addData.data.networkInterfaceUuid) this.addData.data.name = item.name
          })
          this.$emit('ok', this.addData)
          this.addData.dialog = false
        }
      })
    }
  },
  created() {
    this.getNics()
  }
}
</script>

<style></style>
