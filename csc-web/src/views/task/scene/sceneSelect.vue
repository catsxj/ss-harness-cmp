<template>
  <el-select :value="sceneId" placeholder="请选择作业场景" @change="changeData" clearable :disabled="disabled">
    <el-option-group v-for="group in sceneList" :key="group.name" :label="group.name">
      <el-option v-for="item in group.data" :key="item.id" :label="item.name" :value="item.id"></el-option>
    </el-option-group>
  </el-select>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop, Emit, PropSync } from 'vue-property-decorator'
import { getScene } from 'services/task/task'

@Component
export default class extends Vue {
  @Model('change') sceneId!: number
  @Prop({
    type: Boolean,
    default: false
  })
  disabled!: boolean

  // @PropSync('sceneId', { type: Number }) id!: number;
  private sceneList: any = [
    { name: '内置场景', data: [] },
    { name: '自定义场景', data: [] }
  ]

  private created() {
    this.getData()
  }

  private getData() {
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
          this.sceneList[index].data.push(item)
        })
      }
    })
  }

  @Emit('change')
  changeData(value: number) {}
}
</script>
