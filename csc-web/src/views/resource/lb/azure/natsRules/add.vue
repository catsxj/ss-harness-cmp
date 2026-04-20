<template>
  <div>
    <el-dialog append-to-body title="新增入站NAT规则" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data" :status-icon="true" label-width="140px">
        <cmp-form-item label="名称" prop="name" validate="required">
          <el-input v-model="addData.data.name" placeholder="入站NAT规则名称"></el-input>
        </cmp-form-item>
        <cmp-form-item label="前端IP地址" prop="frontEndId" validate="required">
          <el-select v-model="addData.data.frontEndId">
            <el-option v-for="(item, index) in list" :key="index" :label="item.name + '(' + item.publicIpAddress + ')'" :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item label="IP版本" prop=""> IPv4 </cmp-form-item>
        <cmp-form-item label="协议" prop="protocol" validate="required">
          <el-radio-group v-model="addData.data.protocol">
            <el-radio label="TCP">TCP</el-radio>
            <el-radio label="UDP">UDP</el-radio>
          </el-radio-group>
        </cmp-form-item>
        <cmp-form-item v-if="addData.data.protocol == 'TCP'" label="空闲超时（分钟）" prop="idleTimeoutInMinutes" validate="required">
          <el-slider :max="30" v-model="addData.data.idleTimeoutInMinutes" show-input></el-slider>
        </cmp-form-item>
        <cmp-form-item label="端口" prop="frontEndPort" validate="required,port">
          <el-input v-model="addData.data.frontEndPort" placeholder=""></el-input>
        </cmp-form-item>
        <!-- <cmp-form-item label="目标云主机" prop="vmId">
          <el-select v-model="addData.data.vmId">
            <el-option v-for="(item, index) in list" :key="index" :label="item.name"
                        :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item v-if="addData.data.vmId" label="网络IP配置" prop="vmId">
          <el-select v-model="addData.data.vmId">
            <el-option v-for="(item, index) in list" :key="index" :label="item.name"
                        :value="item.id"></el-option>
          </el-select>
        </cmp-form-item> -->
        <cmp-form-item label="浮动IP" prop="floatingIPEnabled">
          <el-radio-group v-model="addData.data.floatingIPEnabled">
            <el-radio :label="false">已禁用</el-radio>
            <el-radio :label="true">已启用</el-radio>
          </el-radio-group>
        </cmp-form-item>
        <cmp-form-item label="目标端口" prop="backEndPort" validate="required,port">
          <el-input v-model="addData.data.backEndPort" placeholder=""></el-input>
        </cmp-form-item>
      </cmp-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createNatRules, getFrontends } from 'services/platform/azure'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            name: ''
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createNatRules({
            inboundNatRule: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.handleSearch()
            }
          })
        }
      })
    },
    getList() {
      getFrontends({
        simple: true,
        params: JSON.stringify([
          {
            param: { slbId: this.addData.data.slbId },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    }
  },
  created() {
    this.getList()
  }
}
</script>

<style></style>
