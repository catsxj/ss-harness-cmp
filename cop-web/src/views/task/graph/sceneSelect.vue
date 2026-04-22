<template>
  <el-select :value="sceneId" placeholder="请选择作业场景" @change="changeData" clearable :disabled="disabled">
    <el-option-group v-for="group in sceneList" :key="group.name" :label="group.name">
      <el-option v-for="item in group.data" :key="item.id" :label="item.name" :value="item.id"></el-option>
    </el-option-group>
  </el-select>
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { getScene } from 'services/task/task'

export default defineComponent({
  model: {
    prop: 'sceneId',
    event: 'change'
  },
  props: {
    sceneId: {
      type: Number
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const sceneList = ref([
      { name: '内置场景', data: [] },
      { name: '自定义场景', data: [] }
    ])
    function getData() {
      getScene({
        page: 1,
        rows: 10000
      }).then((data: any) => {
        if (data.success) {
          const arr = data.data.rows
          arr.forEach((item: any) => {
            let index = 0
            if (!item.internal) {
              index = 1
            }
            (sceneList.value[index].data as any).push(item)
          })
        }
      })
    }
    getData();
    function changeData(id: number) {
      context.emit('change', id)
    }
    return {
      sceneList,
      changeData
    }
  }
})
</script>
