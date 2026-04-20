import { Ref, ref } from '@vue/composition-api'
export default function () {
  const selectionIds: Ref<number[]> = ref([])
  function handleSelectionChange(selections: any) {
    selectionIds.value = selections.map((item: any) => item.id)
  }
  return {
    selectionIds,
    handleSelectionChange
  }
}
