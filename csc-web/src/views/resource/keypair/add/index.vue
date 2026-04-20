<template>
  <div>
    <el-dialog title="新增密钥" :visible.sync="addData.dialog" width="40%">
      <basic-form label-width="100px" :model="addData.data" ref="data">
        <vendor :add-data="addData.data" :types="['OPENSTACK', 'MANAGEONE', 'TCE', 'ALIYUN', 'EASYSTACK']"></vendor>
        <huawei :add-data="addData.data" v-if="addData.data.vendorType == 'HUAWEI' && addData.data.vendorId" :vendor-id="addData.data.vendorId"></huawei>
        <tencent :add-data="addData.data" v-if="addData.data.vendorType == 'TENCENT' && addData.data.vendorId" :vendor-id="addData.data.vendorId"></tencent>
        <aws :add-data="addData.data" v-if="addData.data.vendorType == 'AWS' && addData.data.vendorId" :vendor-id="addData.data.vendorId"></aws>
        <tce :add-data="addData.data" v-if="(addData.data.vendorType == 'TCE' || addData.data.vendorType == 'ALIYUN') && addData.data.vendorId" :vendor-id="addData.data.vendorId"></tce>
        <op :add-data="addData.data" v-if="(addData.data.vendorType == 'OPENSTACK' || addData.data.vendorType == 'EASYSTACK' || addData.data.vendorType == 'MANAGEONE') && addData.data.vendorId" :vendor-id="addData.data.vendorId"></op>
        <qcloud :add-data="addData.data" v-if="addData.data.vendorType == 'QCLOUD' && addData.data.vendorId" :vendor-id="addData.data.vendorId"></qcloud>
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
import huawei from './huawei.vue'
import tencent from './tencent.vue'
import tce from './tce.vue'
import op from './op.vue'
import qcloud from './qcloud'
import aws from './aws.vue'
import vendor from '@/components/setVendor/index.vue'
import { downloadFile } from 'utils'

import { conditionCloudVendor, createKey, existKey } from 'services/platform/index'
export default {
  components: {
    huawei,
    tencent,
    op,
    qcloud,
    tce,
    aws,
    vendor
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
    }
  },
  watch: {},
  data() {
    return {
      vendorList: []
    }
  },
  methods: {
    changeVendor() {
      this.vendorList.forEach(item => {
        if (item.id === this.addData.data.vendorId) {
          this.$set(this.addData.data, 'regionId', '')
          this.$set(this.addData.data, 'name', '')
          this.addData.data.vendorType = item.type
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          existKey({
            condition: JSON.stringify({
              condition: 'exist',
              name: this.addData.data.name,
              vendorId: this.addData.data.vendorId
            })
          }).then(data => {
            if (data.success) {
              const obj = Object.assign({}, this.addData.data)
              // delete obj.region
              // delete obj.availablitiyZone
              // delete obj.vendorType
              if (this.addData.data.publicKey) {
                createKey(obj).then(data => {
                  if (data.success) {
                    this.$message({
                      type: 'success',
                      message: data.message
                    })
                    this.addData.dialog = false
                    this.$emit('back')
                  }
                })
              } else {
                createKey(obj).then(data => {
                  if (data.success) {
                    this.$message({
                      type: 'success',
                      message: data.message
                    })
                    this.addData.dialog = false
                    downloadFile('/ims/v1/keypairs/download', {
                      id: data.data
                    })
                    this.$emit('back')
                  }
                })
              }
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
