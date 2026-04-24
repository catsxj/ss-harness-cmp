import { ref } from 'vue'
export default function () {
  const selectionIds = ref([])
  function handleSelectionChange(selections) {
    selectionIds.value = selections.map((item) => item.id)
  }
  return {
    selectionIds,
    handleSelectionChange
  }
}
