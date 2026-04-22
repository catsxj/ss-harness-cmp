import { ref } from 'vue'

interface Selectable {
  id: number | string
}

export default function useSelection<T extends Selectable = Selectable>() {
  const selectionIds = ref<Array<T['id']>>([])
  function handleSelectionChange(selections: T[]): void {
    selectionIds.value = selections.map((item) => item.id)
  }
  return { selectionIds, handleSelectionChange }
}
