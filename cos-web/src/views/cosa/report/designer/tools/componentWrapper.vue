<template>
  <section id="wrapper" :style="{ backgroundColor: global.backgroundColor, backgroundImage: global.backgroundImage }">
    <grid-layout
      :layout="elements"
      :col-num="gridNumber"
      :row-height="32"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
    >
      <template v-for="element in elements">
        <grid-item class="grid-item" :key="element.uuid" :i="element.i" :x="element.x" :y="element.y" :w="element.w" :h="element.h">
          <div :style="{ backgroundColor: global.elementBackgroundColor, borderRadius: global.radius, height: '100%' }">
            <component :is="`widget-${element.value}`" :element="element" v-if="element.value" :isEdit="false" :ref="`component${element.uuid}`" :globalOptions="global"></component>
          </div>
        </grid-item>
      </template>
    </grid-layout>
  </section>
</template>
<script>
import { renderWidgets } from '../widgets/widgets'
import { cloneDeep } from 'lodash-es'
import { getPanelDetail } from '@/services/reportform/designer'
import VueGridLayout from 'vue-grid-layout'
import { gridNumber } from '../config'
const GridLayout = VueGridLayout.GridLayout
const GridItem = VueGridLayout.GridItem
renderWidgets()
export default {
  components: {
    GridLayout,
    GridItem
  },
  props: ['elementLists', 'globalOptions', 'propsUuid'],
  data() {
    return {
      elements: [],
      global: {},
      uuid: '',
      height: 0,
      gridNumber
    }
  },
  watch: {
    '$route.path'(val) {
      if (val) {
        this.getComponents()
      }
    }
  },
  mounted() {
    this.getComponents()
  },
  methods: {
    async getComponents() {
      const { path } = this.$route
      const reg = /customreport\/.+/
      if (reg.test(path)) {
        // 菜单展示
        const [defaultPath, uuid] = path.match(reg)[0].split('/')
        this.uuid = uuid
        const { data } = await getPanelDetail(this.uuid)
        try {
          if (data.content) {
            const { elementLists, global } = JSON.parse(data.content)
            this.elements = elementLists
            this.global = global
          }
        } catch (error) {
          this.elements = []
        }
      } else if (this.propsUuid) {
        // 列表预览
        this.uuid = this.propsUuid
        const { data } = await getPanelDetail(this.uuid)
        if (data.content) {
          const { elementLists, global } = JSON.parse(data.content)
          this.elements = elementLists
          this.global = global
        }
      } else {
        // 设计器预览
        this.elements = cloneDeep(this.elementLists)
        this.global = cloneDeep(this.globalOptions)
      }
      const { theme } = this.global
      document.body.style.setProperty('--d-text-color', theme == 'dark' ? '#fff' : '#393b3e')
      document.body.style.setProperty('--d-th-backgroundColor', theme == 'dark' ? 'transparent' : '#f7f7f7')
    }
  }
}
</script>
<style lang="scss" scoped>
section {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}
::v-deep .form-search {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden !important;
}
</style>
