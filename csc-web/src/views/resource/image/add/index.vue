<template>
  <div>
    <el-dialog title="新增镜像" :visible.sync="addData.dialog" width="40%">
      <el-form label-width="100px" :model="addData.data" ref="data">
        <privatePool :add-data="addData.data" :vendorType="vendorType" v-if="vendorType == 'OPENSTACK' || vendorType == 'EASYSTACK'"></privatePool>
        <vendor :add-data="addData" :vendorType="vendorType" :showZone="vendorType !== 'HUAWEI' && vendorType !== 'ALIYUN'" v-else></vendor>
        <huawei :add-data="addData.data" :title="addData.title" v-if="vendorType == 'HUAWEI' && addData.data.vendorId" :vendor-id="addData.data.vendorId"></huawei>
        <tencent :add-data="addData.data" :title="addData.title" v-if="vendorType == 'TENCENT' && addData.data.vendorId" :vendor-id="addData.data.vendorId" :regionId="addData.data.regionId"></tencent>
        <aws :add-data="addData.data" :title="addData.title" v-if="vendorType == 'AWS' && addData.data.vendorId" :vendor-id="addData.data.vendorId" :regionId="addData.data.regionId"></aws>
        <ali :add-data="addData.data" :title="addData.title" :region-id="addData.data.regionId" v-if="vendorType == 'ALIYUN' && addData.data.vendorId && addData.data.regionId" :vendor-id="addData.data.vendorId"></ali>
        <op ref="op" :add-data="addData.data" :title="addData.title" :region-id="addData.data.regionId" v-if="vendorType == 'OPENSTACK'" :vendor-id="addData.data.vendorId"></op>
        <easy-stack ref="easyStack" :add-data="addData.data" :title="addData.title" :region-id="addData.data.regionId" v-if="vendorType == 'EASYSTACK'" :vendor-id="addData.data.vendorId"></easy-stack>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import huawei from './huawei.vue'
import ali from './alyun.vue'
import aws from './aws.vue'
import tencent from './tencent.vue'
import vendor from '@/components/publicPool/index.vue'
import privatePool from '@/components/privatePool/index.vue'
import op from './openstack.vue'
import easyStack from './easyStack.vue'
import { createImage } from 'services/platform/index'
export default {
  components: {
    huawei,
    ali,
    aws,
    vendor,
    tencent,
    privatePool,
    op,
    easyStack
  },
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
    },
    vendorType: {
      type: String
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.vendorType == 'OPENSTACK' || this.vendorType == 'EASYSTACK') {
            const obj = this.$refs.op.getPostData()
            if (obj) return
          }
          this.loading = true
          createImage(this.addData.data).then(data => {
            this.loading = false
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('getData')
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
