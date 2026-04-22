import { ref } from '@vue/composition-api'
export default function (itemData:any) {
  const { origin, id, ...others } = itemData
  const applyData = others.configs ? others : null
  const nodeRef = ref();
  const formRef = ref()
  function getPostData() {
    let data = false
    formRef.value.validate((valid:boolean) => {
      if (valid) {
        if (itemData.origin === 'create') {
          const result = nodeRef.value && nodeRef.value.getPostData()
          if (result === false) return
          data = {
            ...itemData,
            ...(result || {})
          }
        } else {
          data = itemData
        }
      }
    })
    return data
  }
  return {
    nodeRef,
    formRef,
    applyData,
    getPostData
  }
}
