<template>
  <el-dialog title="添加附加网段" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
    <basic-form :model="addCidr" ref="addCidr" label-width="120px">
      <basic-form-item label="专有网络"> {{ addData.addRow.name }} / {{ addData.addRow.vpcId }} </basic-form-item>
      <basic-form-item label="cidr: " prop="cidr" validate="required,cidr">
        <el-radio-group v-model="radio">
          <el-row>
            <el-col :span="24">
              <el-radio :label="0">
                推荐网段
                <el-tooltip content="一旦创建成功，网段不能修改" placement="right">
                  <el-button type="text"><i class="el-icon-question"></i></el-button>
                </el-tooltip>
              </el-radio>
            </el-col>
            <el-col :span="24">
              <el-radio :label="1">
                高级配置网段
                <el-tooltip popper-class="sssa" content="一旦创建成功，网段不能修改。支持使用 192.168.0.0/16、172.16.0.0/12、10.0.0.0/8及其子网作为专有网络地址段，子网掩码有效范围 16-24。填写示例：192.168.0.0/16" placement="right">
                  <el-button type="text"><i class="el-icon-question"></i></el-button>
                </el-tooltip>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
        <template v-if="radio === 0">
          <el-select v-model="addCidr.cidr" clearable>
            <el-option label="172.16.0.0/12" value="172.16.0.0/12"></el-option>
            <el-option label="10.0.0.0/8" value="10.0.0.0/8"></el-option>
            <el-option label="192.168.0.0/16" value="192.168.0.0/16"></el-option>
          </el-select>
        </template>
        <template v-if="radio === 1">
          <el-input v-model="addCidr.cidr" placeholder="请输入192.168.1.1/24类型格式" clearable></el-input>
        </template>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="addSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { operationIpvs } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      radio: 0,
      addCidr: {
        cidr: ''
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    addSubmit() {
      operationIpvs(this.addData.addRow.id, {
        action: 'associate',
        params: JSON.stringify({
          cidr: this.addCidr.cidr
        })
      }).then(data => {
        const type = data.success ? 'success' : 'error'
        this.$message[type](data.message)
        if (data.success) {
          this.addData.dialog = false
          this.$emit('mcidrback')
        }
      })
    }
  }
}
</script>
