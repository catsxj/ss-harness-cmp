<template>
  <div>
    <el-dialog title="新增弹性IP地址" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data">
          <el-col :span="24">
            <cmp-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </cmp-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="IdleTimeoutInMinutes" :rules="[{ required: true, message: '该字段为必填字段' }]">
              <span slot="label">
                空闲时间：
                <el-tooltip class="item" effect="dark" content="保持 TCP 或 HTTP 连接打开而不依赖于客户端发送保持活动消息" placement="top-start">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input-number v-model="addData.data.IdleTimeoutInMinutes" :controls="false"></el-input-number>
              <span class="m-l-md">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <cmp-form-item label="数量：">
              <el-input-number v-model="num" :min="1" :max="10"></el-input-number>
            </cmp-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <span slot="label">
                单价：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">采用按量付费（流量月结）的计费方式，5GB以下流出流量免费<br />最终费用以实际使用量为准</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <price :price-data="priceData" v-if="priceData">元/GB</price>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getRegion, getDict } from 'services/platform/index'
import { getResource, createPublicIps, getEipPirce } from 'services/platform/azure'
import price from '@/components/price.vue'
export default {
  components: { price },
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
      resourceData: [],
      loading: false,
      priceData: {},
      num: 1
    }
  },
  methods: {
    getPirce() {
      getEipPirce({
        regionId: this.addData.data.regionId,
        category: 'static',
        sku: 'Global'
      }).then(data => {
        if (data.success) {
          this.priceData = data.data.find(item => item.unitPrice)
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createPublicIps({ publicIPAddress: this.addData.data, num: this.num }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  },
  created() {
    this.getPirce()
  }
}
</script>

<style></style>
