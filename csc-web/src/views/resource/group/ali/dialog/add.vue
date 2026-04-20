<template>
  <div>
    <el-dialog title="新增安全组" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="120px" :model="addData.data" ref="data">
        <vendor :add-data="addData" vendorType="ALIYUN" @vendorId="getVpc" :show-zone="false"></vendor>
        <basic-form-item label="模板：" prop="category" validate="required" required-message="请选择模板">
          <el-select v-model="addData.data.category">
            <el-option v-for="(item, index) in categoryList" :label="item.name" :value="item.value" :key="index"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="安全组类型：" prop="securityGroupType" validate="required" required-message="请选择安全组类型">
          <el-select v-model="addData.data.securityGroupType">
            <el-option v-for="(item, index) in securityGroupTypeList" :label="item.name" :value="item.value" :key="index"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="VPC：" prop="vpcUuid" validate="required">
          <el-select v-model="addData.data.vpcUuid" filterable>
            <el-option v-for="item in vpcList" :label="item.name + '(' + item.ip + ')'" :value="item.vpcId" :key="item.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="名称：" prop="name" validate="required,aliName" required-message="请输入名称">
          <el-input v-model="addData.data.name"></el-input>
        </basic-form-item>
        <basic-form-item label="描述：" prop="remark" validate="aliRemark">
          <el-input type="textarea" v-model="addData.data.remark" :maxlength="256"></el-input>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getRegion, createGroup, getVpc } from 'services/platform/index'
import vendor from '@/components/publicPool/index.vue'
const categoryList = [
  {
    name: 'Linux',
    value: 'LINUX'
  },
  {
    name: 'Windows',
    value: 'WINDOWS'
  }
]
const securityGroupTypeList = [
  {
    name: '普通安全组',
    value: 'normal'
  },
  {
    name: '企业级安全组',
    value: 'enterprise'
  }
]
export default {
  components: { vendor },
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
      regionList: [],
      vpcList: [],
      categoryList,
      securityGroupTypeList
    }
  },
  methods: {
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.vpcList = data.data.rows.map(item => {
            return {
              ...item,
              ip: item.cidr ? JSON.parse(item.cidr).join(',') : ''
            }
          })
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createGroup(this.addData.data).then(data => {
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
