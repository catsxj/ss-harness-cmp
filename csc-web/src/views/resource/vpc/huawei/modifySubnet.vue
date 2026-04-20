<template>
  <div>
    <el-dialog title="编辑子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <basic-form label-width="90px" :model="addData.data" ref="data">
          <basic-form-item label="子网名称" prop="name" validate="required,noChinese">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
          <basic-form-item label="DNS" prop="dnsName" validate="muchDns">
            <el-input type="textarea" v-model="addData.data.dnsName" placeholder="每行一条(例如: 114.114.114.114)"></el-input>
          </basic-form-item>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifySubnet } from 'services/platform/index'
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
      categoryData: [
        {
          value: 'VLAN',
          name: 'VLAN'
        },
        {
          value: 'VXLAN',
          name: 'VXLAN'
        }
      ],
      zoneData: []
    }
  },
  methods: {
    ok() {
      // dns过滤
      function DnsFilter(mobiles) {
        if (!mobiles) return mobiles
        let i,
          result = '',
          c
        for (i = 0; i < mobiles.length; i++) {
          c = mobiles.substr(i, 1)
          if (c == '\n') {
            result = result + '/'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('/')
        return result
      }
      this.$refs.data.validate(valid => {
        if (valid) {
          this.addData.data.dnsNames = DnsFilter(this.addData.data.dnsName)
          modifySubnet(this.addData.data).then(data => {
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
  created() {}
}
</script>

<style></style>
