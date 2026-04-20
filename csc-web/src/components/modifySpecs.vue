<template>
  <span>
    <div class="action-divider" v-if="timeComparison"></div>
    <el-button type="text" v-if="timeComparison" :disabled="detail.status == 'BUILDING'" @click="modifySpec(detail)"> <i class="el-icon-edit"></i> 升级 </el-button>
    <el-dialog title="升级" :visible.sync="addData.dialog" width="70%">
      <el-alert :title="tip" type="warning" show-icon v-if="tip" class="m-b-sm"></el-alert>
      <basic-form label-width="120px" :model="addData.data" ref="data">
        <basic-form-item label="类型：">
          <el-radio-group v-model="value">
            <el-radio-button label="1">规格升级</el-radio-button>
            <el-radio-button label="2">数据盘扩容</el-radio-button>
          </el-radio-group>
        </basic-form-item>
        <UpgradeSpec ref="specRef" :item-data="itemData" v-if="value == '1'"></UpgradeSpec>
        <ExpansionDisk ref="specRef" :item-data="diskItemData" v-else></ExpansionDisk>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
import UpgradeSpec from 'views/personal/apply/components/UpgradeSpecDB.vue'
import ExpansionDisk from 'views/personal/apply/components/ExpansionDisk.vue'
import { modifyResourceEFC } from 'services/services/product'
export default {
  components: { UpgradeSpec, ExpansionDisk },
  props: {
    detail: {
      type: Object
    },
    service: {
      type: String
    },
    tip: {
      type: String
    }
  },
  computed: {
    itemData() {
      const { service, uuid: instance, skuId, name: instanceName, categoryId, spec, expiredTime } = this.addData.data
      return {
        service,
        instance,
        instanceName,
        expiredTime,
        preview: {
          skuId,
          categoryId,
          specName: spec
        }
      }
    },
    diskItemData() {
      const { service, uuid: instance, diskKuId: skuId, name: instanceName, oldDataDisk, expiredTime } = this.addData.data
      return {
        service,
        instance,
        instanceName,
        expiredTime,
        preview: {
          skuId,
          specName: oldDataDisk + 'GB'
        }
      }
    },
    timeComparison() {
      const a = new Date().getTime()
      const b = new Date(this.detail.expiredTime).getTime()
      return a < b
    }
  },
  data() {
    return {
      value: '1',
      loading: false,
      addData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    modifySpec(data) {
      this.addData = {
        dialog: true,
        data: {
          categoryId: data.categoryId,
          diskSkuId: data.diskSkuId,
          expiredTime: data.expiredTime,
          spec: data.spec,
          oldDataDisk: data.dataDisk,
          skuId: data.skuId,
          uuid: data.uuid,
          name: data.name,
          service: this.service
        }
      }
      this.value = '1'
    },
    ok() {
      const obj = this.$refs.specRef.getApplyData()
      if (obj.preview.skuId === this.itemData.preview.skuId) return this.$message.error('变更规格不能与原规格相同')
      this.loading = true
      modifyResourceEFC(obj).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.addData.dialog = false
          // if (data.data) this.$router.push({ path: `/order/${data.data}` })
        }
        this.loading = false
      })
    }
  },
  created() {}
}
</script>

<style></style>
