<template>
  <div>
    <el-dialog append-to-body title="新增负载均衡规则" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data" :status-icon="true" label-width="140px">
        <cmp-form-item label="名称" prop="name" validate="required">
          <el-input v-model="addData.data.name" placeholder=""></el-input>
        </cmp-form-item>
        <cmp-form-item label="前端IP地址" prop="frontEndId" validate="required">
          <el-select v-model="addData.data.frontEndId">
            <el-option v-for="(item, index) in frontEndList" :key="index" :label="item.name + '(' + item.publicIpAddress + ')'" :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item label="协议" prop="protocol" validate="required">
          <el-radio-group v-model="addData.data.protocol">
            <el-radio label="TCP">TCP</el-radio>
            <el-radio label="UDP">UDP</el-radio>
          </el-radio-group>
        </cmp-form-item>
        <cmp-form-item label="端口" prop="frontEndPort" validate="required,port">
          <el-input v-model="addData.data.frontEndPort" placeholder=""></el-input>
        </cmp-form-item>
        <cmp-form-item label="后端端口" prop="backEndPort" validate="required">
          <el-input v-model="addData.data.backEndPort" placeholder=""></el-input>
        </cmp-form-item>
        <cmp-form-item label="后端池" prop="backEndId" validate="required">
          <el-select v-model="addData.data.backEndId">
            <el-option v-for="(item, index) in backEndList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item label="运行状况探测" prop="probeId" validate="required">
          <el-select v-model="addData.data.probeId">
            <el-option v-for="(item, index) in probeList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item label="会话持续性" prop="loadDistribution" validate="required">
          <el-select v-model="addData.data.loadDistribution">
            <el-option label="无" value="Default"></el-option>
            <el-option label="客户端IP" value="SourceIP"></el-option>
            <el-option label="客户端IP和协议" value="SourceIPProtocol"></el-option>
          </el-select>
        </cmp-form-item>
        <cmp-form-item label="空闲超时（分钟）" prop="idleTimeoutInMinutes" validate="required">
          <el-slider :max="30" v-model="addData.data.idleTimeoutInMinutes" show-input></el-slider>
        </cmp-form-item>
        <cmp-form-item label="浮动IP" prop="floatingIpEnabled" validate="required">
          <el-switch v-model="addData.data.floatingIpEnabled" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
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
import { createLbRules, getFrontends, getProbes, getBackends } from 'services/platform/azure'
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
      frontEndList: [],
      backEndList: [],
      probeList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createLbRules({
            lbRule: this.addData.data
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
    getFrontList() {
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
          this.frontEndList = data.data.rows
        }
      })
    },
    getBackEndList() {
      getBackends({
        simple: true,
        params: JSON.stringify([
          {
            param: { slbId: this.addData.data.slbId },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.backEndList = data.data.rows
        }
      })
    },
    getProbeList() {
      getProbes({
        simple: true,
        params: JSON.stringify([
          {
            param: { slbId: this.addData.data.slbId },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.probeList = data.data.rows
        }
      })
    }
  },
  created() {
    this.getFrontList()
    this.getBackEndList()
    this.getProbeList()
  }
}
</script>

<style></style>
