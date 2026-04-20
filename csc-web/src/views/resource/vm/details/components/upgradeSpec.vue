<template>
  <el-dialog title="配置变更" append-to-body :visible.sync="config.visible" width="900px">
    <el-alert class="m-b" title="若虚拟机不支持运行时修改配置，须先关机后再申请配置变更" :closable="false" type="warning"> </el-alert>
    <UpgradePublicSpec v-if="isPublic" ref="specRef" :item-data="itemData"></UpgradePublicSpec>
    <template v-else>
      <UpgradeSpec ref="specRef" :item-data="itemData"></UpgradeSpec>
    </template>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="config.visible = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import UpgradeSpec from 'views/personal/apply/components/UpgradeSpec.vue'
import UpgradePublicSpec from '@/views/personal/apply/components/UpgradePublicSpec.vue'
import { modifyResourceEFC } from 'services/services/product'
export default {
  components: { UpgradeSpec, UpgradePublicSpec },
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    isPublic() {
      return ['JDCLOUD', 'ALIYUN', 'TENCENT', 'KINGCLOUD', 'HUAWEI', 'AZURE', 'AWS', 'TIANYI', 'QCLOUD', 'VOLCENGINE', 'MANAGEONE'].includes(this.config.data.vendorType)
    },
    itemData() {
      const { service, uuid: instance, name: instanceName, categoryId, cpu, memory, expiredTime, preview = [], params = {}, flavorId } = this.config.data
      return {
        service,
        instance,
        instanceName,
        expiredTime,
        preview,
        params,
        flavorId,
        upgrade: [
          {
            serviceCode: service,
            categoryId,
            specs: [
              {
                cpu
              },
              {
                memory
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    ok() {
      const obj = this.$refs.specRef.getApplyData()
      if (obj.preview.cpu === obj.upgrade[0].specs[0].cpu && obj.preview.memory === obj.upgrade[0].specs[1].memory) {
        return this.$message.error('变更规格不能与原规格相同')
      }
      this.loading = true
      modifyResourceEFC(obj)
        .then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.config.visible = false
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
