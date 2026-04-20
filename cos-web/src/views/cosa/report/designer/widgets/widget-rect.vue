<template>
  <section :style="style">
    <div v-show="noData" class="noData">
      <img :src="imgUrl" alt="" />
      <p>此图表暂无数据</p>
    </div>
    <div class="rect" style="height: 100%" v-show="!noData">
      <img :src="options.imgUrl" alt="" v-if="options.imgUrl" />
      <div>
        <h4 :style="{ fontSize: options.title.fontSize1 + 'px', fontWeight: options.title.fontWeight1, color: options.title.color1 || '#fff' }">{{ title }}</h4>
        <p :style="{ fontSize: options.title.fontSize2 + 'px', fontWeight: options.title.fontWeight2, color: options.title.color2 || '#fff' }">
          <span>{{ count }}</span>
          <!-- <span>{{ unit }}</span> -->
        </p>
      </div>
    </div>
  </section>
</template>
<script>
import { getPreviewById } from '@/services/reportform/dataset'
import { MinxinStyleOptions } from './minxin-style-options'
import { eventBus } from '../eventBus'
import { isJSON } from '../../utils'
import { packParams } from './widgets.utils'
export default {
  mixins: [MinxinStyleOptions],
  data() {
    return {
      title: '',
      count: '',
      chartData: []
    }
  },
  mounted() {
    if (!this.isEdit) this.getList()
    eventBus.$on('inputChange', data => {
      this.setParamsToGetList(data)
    })
    eventBus.$on('selectChange', data => {
      this.setParamsToGetList(data)
    })
    eventBus.$on('calendarChange', data => {
      this.setParamsToGetList(data)
    })
  },
  computed: {
    imgUrl() {
      return require(`@/assets/designer/alt/rect${this.element.sub ? '-' + this.element.sub : ''}-alt.png`)
    },
    noData() {
      return this.chartData.length == 0
    }
  },
  methods: {
    setParamsToGetList(data) {
      const { params: currentParams, bindUuid, isEdit } = data
      if (bindUuid?.includes && bindUuid.includes(this.element.uuid) && isEdit === this.isEdit) {
        if (isJSON(this.params?.params)) {
          this.params.params = JSON.stringify(packParams(currentParams, JSON.parse(this.params.params)))
        } else {
          this.params.params = JSON.stringify(packParams(currentParams))
        }
        if (this.element.data.datasetId) {
          this.params.page = 1
          this.getList()
        }
      }
    },
    async getList() {
      const {
        datasetId,
        dropList: [[{ alias: xAlias }], [{ alias: yAlias }]]
      } = this.element.data
      const { success, data } = await getPreviewById(datasetId)
      if (success) {
        this.chartData = data.rows
        this.title = data.rows[0][xAlias]
        this.count = data.rows[0][yAlias]
        // this.$store.commit('updateElementOptions', { uuid: this.element.uuid, options: { title: { text: item.alias, count: data.rows[0][item.alias] } } })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.rect {
  display: flex;
  justify-content: center;
  align-items: center;
  h4,
  p {
    margin: 0;
    padding: 5px;
    text-align: center;
  }
}
</style>
