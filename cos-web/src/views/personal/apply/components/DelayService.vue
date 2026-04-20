<template>
  <basic-form label-width="120px" :model="itemData" v-bind="$attrs">
    <basic-form-item label="实例名称：">{{ itemData.instanceName }}</basic-form-item>
    <basic-form-item label="延期时长：" prop="extension" validate="required">
      <el-select v-model="amount" class="w-lg">
        <el-option v-for="item in applyTimeList" :key="item.value" :value="item.value" :label="item.name"></el-option>
      </el-select>
    </basic-form-item>
  </basic-form>
</template>

<script lang="ts">
import { computed, defineComponent, ref, unref, Ref } from '@vue/composition-api'
import { applyTimeList } from '@/views/resource-apply/data/init'

type IProps = {
  itemData: any
}
export default defineComponent({
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props: IProps, context) {
    const { mode = 'Month', extension } = props.itemData
    const amount: Ref<string> = ref(`${extension}|${mode}`)
    const delayData = computed(() => {
      const [extension, mode] = unref(amount).split('|')
      return {
        extension,
        mode
      }
    })
    function getApplyData() {
      return {
        ...props.itemData,
        ...delayData.value
      }
    }
    return {
      applyTimeList,
      amount,
      getApplyData
    }
  }
})
</script>

<style></style>
