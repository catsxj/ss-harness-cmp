<template>
  <div>
    <el-dialog append-to-body :title="addData.status == 'update' ? '编辑网卡' : '添加网卡'" v-if="addData.dialog" :visible.sync="addData.dialog" width="40%">
      <basic-form :model="addData.data" ref="data" label-width="120px">
        <basic-form-item label="端口组：" prop="portGroupId" validate="required">
          <el-select clearable filterable v-model="addData.data.portGroupId" @change="changePortGroup">
            <el-option :key="index" v-for="(d, index) in portGroupData" :label="d.portGroupName" :value="d.portGroupId"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="网卡类型：" prop="type" validate="required">
          <el-select clearable v-model="addData.data.type">
            <el-option label="virtio" value="1"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="IO环大小：" prop="vringbuf" validate="required">
          <el-select v-model="addData.data.vringbuf">
            <el-option label="256" :value="256"></el-option>
            <el-option label="512" :value="512"></el-option>
            <el-option label="1024" :value="1024"></el-option>
            <el-option label="2048" :value="2048"></el-option>
            <el-option label="4096" :value="4096"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="队列数：" prop="queues" validate="required">
          <el-input-number v-model="addData.data.queues" :min="1"> </el-input-number>
        </basic-form-item>
        <basic-form-item label="开启安全组：" prop="enableSecurityGroup" validate="required">
          <el-switch v-model="addData.data.enableSecurityGroup" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
        </basic-form-item>
        <basic-form-item label="安全组：" prop="securityGroupUuid" validate="required" v-if="addData.data.enableSecurityGroup">
          <el-select v-model="addData.data.securityGroupUuid" @change="changeSGroup">
            <el-option :key="index" v-for="(d, index) in sgroupData" :label="d.name" :value="d.groupUuid"></el-option>
          </el-select>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getGroup } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    },
    vendorId: {
      type: Number
    },
    portGroupData: {
      Array
    }
  },
  data() {
    return {
      sgroupData: []
    }
  },
  methods: {
    changePortGroup() {
      this.portGroupData.forEach(item => {
        if (item.portGroupId == this.addData.data.portGroupId) {
          this.$set(this.addData.data, 'portGroupName', item.portGroupName)
        }
      })
    },
    // 获取安全组
    getSGroup() {
      getGroup({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          vendorId: this.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.sgroupData = data.data.rows
        }
      })
    },
    changeSGroup() {
      this.sgroupData.forEach(item => {
        if (item.groupUuid == this.addData.data.securityGroupUuid) {
          this.$set(this.addData.data, 'sgroupName', item.name)
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.addData.dialog = false
          this.$emit('commit', this.addData.data)
        }
      })
    }
  },
  created() {
    console.log(this.portGroupData)
    this.getSGroup()
  }
}
</script>

<style scoped lang="scss"></style>
