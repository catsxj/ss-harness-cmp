<template>
  <el-dialog title="服务授权" :close-on-click-modal="false" :visible.sync="dialog.visible" width="660px">
    <el-transfer :titles="['未选择的租户', '已选择的租户']" v-model="tenantIds" :data="tenantList" :props="{ label: 'name', key: 'id' }"></el-transfer>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="dialog.visible = false">取 消</el-button>
      <el-button type="primary" @click="grantSubmit('add')" :loading="loading">授权</el-button>
      <el-button type="danger" @click="grantSubmit('remove')" :loading="loading" v-if="serviceIds.length">取消授权</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import { getTenant } from 'services/system/tenant'
import { getTenantByservice, serviceGrantBatch, serviceGrantTenant } from 'services/services/spec'
import { ITenant } from '@/models/tenant'
type IState = {
  tenantIds: number[]
  tenantList: ITenant[]
}
type IProps = {
  dialog: Base.IDialog
  serviceIds: number[]
}
export default defineComponent({
  props: {
    dialog: {
      type: Object
    },
    serviceIds: {
      type: Array
    }
  },
  setup(props: IProps, context) {
    const state: IState = reactive({
      tenantIds: [],
      tenantList: []
    })
    const { id: serviceId } = props.dialog.record
    if (serviceId) {
      getTenantByservice(serviceId).then((data) => {
        if (data.success) {
          state.tenantIds = data.data.map((item: any) => item.tenantId)
        }
      })
    }
    async function getTenantList() {
      const res = await getTenant({ simple: true })
      if (res.success) {
        state.tenantList = res.data.rows
      }
    }
    getTenantList()
    const loading = ref(false)
    function grantTenantSubmit() {
      serviceGrantTenant(serviceId, state.tenantIds)
        .then((data) => {
          if (data.success) {
            Message.success(data.message)
            props.dialog.visible = false
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
    function grantSubmit(type: string) {
      loading.value = true
      if (serviceId) {
        grantTenantSubmit()
        return
      }
      serviceGrantBatch({
        type: type,
        serviceIds: props.serviceIds,
        tenantIds: state.tenantIds
      })
        .then((data) => {
          if (data.success) {
            Message.success(data.message)
            props.dialog.visible = false
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
    return {
      ...toRefs(state),
      loading,
      grantSubmit
    }
  }
})
</script>
