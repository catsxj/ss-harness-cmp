<template>
  <basic-form-item label="OP团队：" :prop="`${preProp}tenantUuid`" validate="required" class="w-xl">
    <el-select v-model="addData.tenantUuid" placeholder="请选择OpenStack团队" filterable @change="ok">
      <el-option v-for="(item, index) in tenantList" :key="index" :value="item.tenantUuid" :label="item.name"></el-option>
    </el-select>
  </basic-form-item>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import { getOsTenant } from 'services/system/tenant'
@Component
export default class SyncLog extends Vue {
  @Prop({
    type: Object,
    default: function () {
      return {
        data: {
          labelIds: []
        },
        dialog: false
      }
    }
  })
  addData!: any

  @Prop({
    type: [String, Number]
  })
  vendorId!: any

  @Prop({
    type: String,
    default: ''
  })
  preProp!: string

  private tenantList: any = []
  private getOsTenant() {
    if (!this.vendorId) return
    getOsTenant({
      page: 1,
      rows: 999,
      params: JSON.stringify([{ param: { vendorId: this.vendorId }, sign: 'EQ' }])
    }).then((data: any) => {
      if (data.success) {
        this.tenantList = data.data.rows
      }
    })
  }

  @Emit('back')
  private ok() {
    this.tenantList.forEach((item: any) => {
      if (item.tenantUuid == this.addData.tenantUuid) this.addData.osTenantName = item.name
    })
  }

  @Watch('vendorId', { immediate: true })
  onChangeValue() {
    if (this.tenantList.length) this.$set(this.addData, 'tenantUuid', '')
    this.getOsTenant()
  }
}
</script>
