<template>
  <div>
    <el-dialog title="新增可用性集" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <vendor :add-data="addData" @vendorId="getResource"></vendor>
          <el-col :span="24">
            <basic-form-item label="资源组：" prop="resourceGroupId" validate="required" required-message="该字段为必填字段">
              <el-select v-model="addData.data.resourceGroupId">
                <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>
              <span slot="label">
                容错域：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">同一容错域中的云主机共享一个通用电源和物理网络开关。</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-slider @change="setGx" v-model="addData.data.faultDomainCount" :min="1" :max="2" show-input> </el-slider>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.faultDomainCount == 1" key="1">
            <el-form-item>
              <span slot="label">
                更新域：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">同一更新域中的云主机将在计划内维护期间同时重启。金山云 从不同时重启多个更新域。</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-slider v-model="addData.data.updateDomainCount" :min="1" :max="1" show-input> </el-slider>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-else key="20">
            <el-form-item>
              <span slot="label">
                更新域：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">同一更新域中的云主机将在计划内维护期间同时重启。金山云 从不同时重启多个更新域。</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-slider v-model="addData.data.updateDomainCount" :min="1" :max="20" show-input> </el-slider>
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
import { getRegion } from 'services/platform/index'
import { getResource, createSet } from 'services/platform/azure'
import vendor from '@/components/publicPool/index.vue'

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
      resourceData: [],
      loading: false
    }
  },
  methods: {
    setGx() {
      if (this.addData.data.faultDomainCount == 1) this.$set(this.addData.data, 'updateDomainCount', 1)
    },
    getRegion() {
      getRegion({ vendorId: this.addData.data.vendorId }).then(data => {
        if (data.success) {
          this.regionList = data.data
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createSet({ availabilitySet: this.addData.data }).then(data => {
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
    },
    getResource() {
      if (this.addData.data.resourceGroupId) this.addData.data.resourceGroupId = ''
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
    }
  }
}
</script>

<style></style>
