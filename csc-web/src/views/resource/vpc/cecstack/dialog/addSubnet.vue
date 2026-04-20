<template>
  <div>
    <el-dialog title="添加子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <basic-form label-width="120px" :model="addData.data" ref="data">
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="VPC网段: ">
                {{ addData.row.cidr }}
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="子网名称：" prop="name" validate="required" required-message="请输入子网名称">
                <el-tooltip popper-class="sssa" content="长度为2~128个字符，以英文大小字母或中文开头，可包含数字、下划线（_）和连字符（-）" placement="right">
                  <el-button type="text"><i class="el-icon-question"></i></el-button>
                </el-tooltip>
                <el-input v-model="addData.data.name"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="CIDR：" prop="cidr" validate="required">
                <el-input v-model="addData.data.cidr"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
          <!-- <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="开启IPV6：" prop="ipV6Enable">
                <el-switch v-model="addData.data.ipV6Enable" :disabled="addData.ipv6Cidr === '' || addData.ipv6Cidr == null" @change="changeSwitch"></el-switch>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <template v-if="addData.data.ipV6Enable">
                <basic-form-item label="IPV6 CIDR：" prop="ipv6Cidr" validate="required" required-message="ipv6 cidr不能为空">
                  <span>{{ ipv6s.pre }}</span>
                  <el-input-number v-model="addData.data.ipv6Cidr" :min="0" :max="255"></el-input-number>
                  <span>{{ ipv6s.back }}</span>
                </basic-form-item>
              </template>
            </el-col>
          </el-row> -->
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="可用区：" prop="zone" validate="required" required-message="请选择地区">
                <el-select v-model="addData.data.zone">
                  <el-option v-for="(item, index) in zoneList" :label="item.name" :value="item.zoneId" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="描述：" prop="remark">
                <el-tooltip popper-class="sssa" content="描述可以为空，或输入2~256个中英文字符，不能以http://和https://开头" placement="right">
                  <el-button type="text"><i class="el-icon-question"></i></el-button>
                </el-tooltip>
                <el-input type="textarea" v-model="addData.data.remark"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
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
import { getZone, createSubnet } from 'services/platform/index'
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
      ipv6: null,
      ipv6cidr: [],
      zoneList: [],
      ipv6s: {
        pre: '',
        back: ''
      }
    }
  },
  methods: {
    changeIpv6(value) {
      this.addData.data.ipv6Cidr = ''
      if (value === 'customize') {
        const arr = this.addData.ipv6Cidr.split('::')
        const a = arr[0].slice(0, -2)
        this.ipv6cidr[0] = a
        this.ipv6cidr[1] = arr[1]
      }
    },
    changeSwitch(val) {
      if (val) {
        const arr = this.addData.ipv6Cidr.split('::')
        console.log(arr)
        this.ipv6s = {
          pre: arr[0].slice(0, -2),
          back: '::/64'
        }
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createSubnet(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.addData.data.ipv6Cidr = ''
              this.$emit('goBack')
            }
          })
        }
      })
    },
    getZone() {
      getZone({ vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }).then(data => {
        if (data.success) {
          this.zoneList = data.data
        }
      })
    }
  },
  created() {
    console.log(this.addData)
    this.getZone()
  }
}
</script>

<style></style>
