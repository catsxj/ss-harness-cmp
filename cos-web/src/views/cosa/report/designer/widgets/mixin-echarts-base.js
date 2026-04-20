import * as echarts from 'echarts'
import Vue from 'vue'
import { getPreviewById } from '@/services/reportform/dataset'
import { debounce, cloneDeep } from 'lodash-es'
import { setStyleWithPixel, packParams } from './widgets.utils'
import { eventBus } from '../eventBus'
import { isJSON, $dom } from '../../utils'
import 'echarts-liquidfill/src/liquidFill.js'
import './theme/macarons'
import './theme/shine'
import './theme/dark'
const ChinaJSON = require('./china.json')
export const minxinEchartsBase = {
  props: {
    element: {
      type: Object,
      default: () => ({
        data: {},
        style: {},
        uuid: '',
        options: {}
      })
    },
    isEdit: {
      // 是否在设计器页面
      type: Boolean,
      default: false
    },
    // 预览或者已绑定的自定义报表菜单使用globalOptions
    globalOptions: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    'element.options': {
      handler(val) {
        this.resetOptions()
      },
      deep: true
    },
    'global.theme': {
      handler(data) {
        this.resetOptions()
      }
    }
  },
  data() {
    return {
      chartData: [],
      selfChart: undefined,
      params: {}
    }
  },
  computed: {
    global() {
      return this.$store.state.elements.globalOptions
    },
    style() {
      const s = setStyleWithPixel(this.element.style)
      return {
        ...s,
        borderRadius: this.global.radius || this.globalOptions.radius,
        backgroundColor: this.global.elementBackgroundColor || this.globalOptions.elementBackgroundColor,
        padding: (this.global.elementPadding || this.globalOptions.elementPadding) + 'px'
      }
    },
    noData() {
      return this.chartData.length == 0
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
  methods: {
    resetOptions() {
      const { datasetId, dropList } = this.element.data
      if (datasetId && dropList?.length) return this.initChart()
      this.selfChart?.dispose && this.selfChart.dispose()
      this.selfChart = undefined
    },
    setParamsToGetList(data) {
      const { params: currentParams, bindUuid, isEdit } = data
      if (bindUuid?.includes && bindUuid.includes(this.element.uuid) && this.isEdit === isEdit) {
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
      const { success, data } = await getPreviewById(this.element.data.datasetId, { ...this.params, rows: 999 })
      if (success) {
        this.chartData = data.rows
        this.initChart()
      }
    },
    initChart() {
      if (this.selfChart) this.selfChart.clear()
      if (!this.selfChart) this.selfChart = echarts.init($dom(`chart-${this.element.uuid}-${this.isEdit}`))
      const {
        dropList: [xAxisKey, yAxisKeys]
      } = this.element.data
      const options = new WidgetChart(this.element, this.chartData).setChartOptions(this.element.value)
      options.legend.data = ['pie'].includes(this.element.value) ? this.chartData.map(item => item[xAxisKey[0].alias]) : yAxisKeys.map(item => item.alias)
      options.backgroundColor = ''
      if (options.legend?.textStyle) {
        options.legend.textStyle.color = this.global.textColor || this.globalOptions.textColor || '#eee'
      }
      if (options.title?.textStyle) {
        options.title.textStyle.color = this.global.textColor || this.globalOptions.textColor || '#eee'
      }
      if (options?.legend?.show) {
        if (options.legend.orient == 'horizontal') {
          options.legend.top = 5
          options.legend.left = 'center'
          options.legend.right = 'auto'
          options.legend.width = '80%'
        } else {
          options.legend.top = 'center'
          options.legend.right = 10
          options.grid.right = 150
          options.legend.height = '80%'
        }
      }
      // console.log(options)
      this.selfChart.setOption(options)
      this.listenChartSizeChange()
    },
    listenChartSizeChange() {
      const debounceFunc = debounce(() => {
        this.selfChart.resize()
      }, 100)
      Vue.nextTick(() => {
        const el = $dom(`outer-${this.element.uuid}`)
        if (el) {
          el.resizeObserver = new ResizeObserver(debounceFunc)
          el.resizeObserver.observe(el)
        }
      })
    }
  }
}

class WidgetChart {
  constructor(element, chartData) {
    this.element = element
    // this.options = cloneDeep(element.options)
    // this.dropList = element.data.dropList
    this.chartData = chartData
  }

  setChartOptions(type) {
    switch (type) {
      case 'pie':
        return new PieChart(this.element, this.chartData).create()
      case 'gauge':
        return new GaugeChart(this.element, this.chartData).create()
      case 'liquid-fill':
        return new LiquidFillChart(this.element, this.chartData).create()
      case 'map':
        return new MapChart(this.element, this.chartData).create()
      default:
        return new AxisChart(this.element, this.chartData).create()
    }
  }
}
/**
 * 基础组件类： dropList: 存储x,y轴坐标key字段，chartData: 获取对应的value值
 */
class BasicChart {
  constructor(element, chartData) {
    this.element = element
    this.options = cloneDeep(element.options)
    this.dropList = element.data.dropList
    this.chartData = chartData
  }
}
/**
 * 饼图
 */
class PieChart extends BasicChart {
  create() {
    const [xAxisKey, yAxisKeys] = this.dropList
    const total = this.chartData.reduce((p, c) => {
      return p + (c[yAxisKeys[0].alias] ? Number(c[yAxisKeys[0].alias]) : 0)
    }, 0)
    const obj = {
      name: this.options.title.text,
      type: 'pie',
      radius: this.options.config?.radius.map(item => {
        return (item ?? 0) + '%'
      }),
      itemStyle: {
        borderRadius: this.options.config.isRadius ? 10 : 0,
        borderColor: '#fff',
        borderWidth: this.options.config.isRadius ? 2 : 0
      },
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: () => {
          return total
        },
        color: this.options.textStyle.color,
        fontSize: this.options.textStyle.fontSize
      },
      center: this.options.legend?.show && this.options.legend?.orient == 'vertical' ? ['30%', '50%'] : ['50%', '50%'],
      data: this.chartData.map(item => {
        return {
          value: item[yAxisKeys[0].alias],
          name: item[xAxisKey[0].alias]
        }
      })
    }
    if (this.options.config.isHalf) {
      obj.startAngle = 180
      obj.data.push({
        name: '总数',
        value: total,
        itemStyle: {
          color: 'transparent'
        }
      })
      obj.center[1] = '75%'
    }
    if (this.element.sub == 'rose') {
      obj.roseType = 'radius'
      obj.itemStyle = { borderRadius: 5 }
    }
    this.options.series = [obj]
    return this.options
  }
}
/**
 * 仪表盘
 */
class GaugeChart extends BasicChart {
  create() {
    this.options.legend = {}
    const [itemData] = this.chartData
    const [[{ alias: xAlias }], [{ alias: yAlias }]] = this.dropList
    const obj = {
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: this.chartData.map(item => item[yAlias]).reduce((prev, curr) => Number(prev) + Number(curr)),
      splitNumber: 10,
      radius: '120%',
      center: ['50%', '70%'],
      data: [
        {
          value: Number(itemData[yAlias])
        }
      ],
      detail: {
        formatter: function (value) {
          return `${xAlias}： ${value}`
        },
        color: this.options.textStyle.color,
        fontSize: this.options.textStyle.fontSize,
        offsetCenter: [0, '30%']
      },
      progress: {
        show: true,
        roundCap: true
      },
      itemStyle: {
        color: this.options.config.progressColor
      }
    }
    this.options.series = [obj]
    return this.options
  }
}
/**
 * 水球图
 */
class LiquidFillChart extends BasicChart {
  create() {
    // const [itemData] = this.chartData
    // console.log(itemData)
    // const [xAxisKey, yAxisKeys] = this.dropList
    // console.log(xAxisKey, yAxisKeys)
    // this.options.legend = { show: false }
    // const total = yAxisKeys.map(item => itemData[item.alias]).reduce((prev, curr) => Number(prev) + Number(curr))
    const [[{ alias: xAlias }], [{ alias: yAlias }]] = this.dropList
    const values = this.chartData.map(item => item[yAlias])
    const total = values.reduce((prev, curr) => Number(prev) + Number(curr))
    // 取指标第一项绘制
    // const value = Number(itemData[yAxisKeys[0].alias])
    const calcFirst = this.options.config.calcFirst ?? false
    const data = values.map(value => (value / total).toFixed(2))
    const obj = {
      color: this.options.color,
      type: 'liquidFill',
      name: xAlias,
      data: calcFirst ? [data[0]] : data,
      itemStyle: {
        shadowBlur: 0,
        // color: this.options.color[0]
        opacity: 0.7
      },
      backgroundStyle: {
        // borderWidth: 5,
        // borderColor: 'red',
        color: this.options.config.liquidBackColor
      },
      radius: '70%',
      center: ['30%', '50%'],
      label: {
        position: ['50%', '50%'],
        textStyle: {
          fontSize: this.options.textStyle.fontSize,
          color: this.options.textStyle.color
        },
        formatter: `${this.chartData[0][xAlias]}：${(values[0] / total).toFixed(2) * 100 + '%'}`
      },
      outline: {
        borderDistance: 0,
        itemStyle: {
          borderWidth: 3,
          borderColor: this.options.color[0],
          shadowBlur: 20
        }
      },
      tooltip: {
        show: false
      }
    }
    this.options.series = [obj]
    return this.options
  }
}
/**
 * 地图
 */
class MapChart extends BasicChart {
  create() {
    echarts.registerMap('china', ChinaJSON)
    const [xAxisKey, yAxisKeys] = this.dropList
    this.options.geo = {
      show: true,
      map: 'china',
      roam: false,
      zoom: 1.23,
      center: [105, 36],
      label: {
        show: false
      },
      tooltip: {
        show: false
      },
      itemStyle: {
        areaColor: this.options.config.mapColor,
        borderColor: this.options.config.borderColor,
        borderWidth: 0.5
      },
      blur: {
        label: {
          show: false
        }
      }
    }
    const obj = {
      name: yAxisKeys[0].alias,
      map: 'china',
      type: 'map',
      coordinateSystem: 'geo',
      center: this.options.geo.center,
      zoom: this.options.geo.zoom,
      label: {
        show: true,
        formatter: value => {
          const { name } = value
          return name
        }
      },
      tooltip: {
        show: true,
        formatter: data => {
          if (data.data) {
            const {
              seriesName,
              data: { name, value }
            } = data
            return `${seriesName}<br/>${name}：${value[2]}`
          }
          return ''
        }
      },
      showLegendSymbol: false, // 存在legend时显示
      data: ChinaJSON.features
        .map(item => ({ name: item.properties.name, value: item.properties.cp }))
        .map(item => {
          const province = this.chartData.find(data => data[xAxisKey[0].alias] == item.name)
          return {
            name: province && province[xAxisKey[0].alias] ? province[xAxisKey[0].alias] : item,
            value: province && province[yAxisKeys[0].alias] ? item.value.concat(province[yAxisKeys[0].alias]) : item.value.concat(0)
          }
        })
    }
    if (this.element.sub == 'scatter') {
      obj.type = 'effectScatter'
      obj.symbol = 'circle'
      obj.symbolSize = 20
      obj.rippleEffect = { brushType: 'stroke' }
    } else {
      obj.itemStyle = {
        areaColor: this.options.config.mapColor,
        borderColor: this.options.config.borderColor,
        borderWidth: 0.5
      }
    }
    this.options.series = [obj]
    this.options.visualMap = {
      type: 'piecewise',
      pieces: this.options.pieceList?.length ? this.options.pieceList.map((item, index) => ({ ...item, color: this.options.color[index] })) : [{ min: 0, color: this.options.config.lightColor }]
    }
    return this.options
  }
}
/**
 * 带坐标轴的图表：柱状图、线图
 */
class AxisChart extends BasicChart {
  create() {
    const [xAxisKey, yAxisKeys] = this.dropList
    this.options.tooltip = {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    }
    this.options.series = yAxisKeys.map(key => {
      const obj = {
        name: key.alias,
        data: this.chartData.map(item => (item[key.alias] ? Number(item[key.alias]) : 0)),
        type: this.element.value,
        barWidth: this.options?.config?.barWidth || 20,
        label: {
          show: this.options?.config?.showLabel,
          position: this.element.sub == 'reverse' ? 'right' : 'top',
          color: this.options?.textStyle?.color
        }
      }
      obj.stack = this.element.sub == 'stack' ? 'total' : ''
      obj.smooth = this.options?.config?.smooth
      if (this.element.sub && this.element.sub.indexOf('area') >= 0) {
        obj.areaStyle = {}
        obj.emphasis = {
          focus: 'series'
        }
        if (this.element.sub == 'stack-area') {
          obj.stack = 'total'
        }
      }
      return obj
    })
    const xAxis = {
      show: true,
      type: 'category',
      data: this.chartData.map(item => item[xAxisKey[0].alias]),
      axisLabel: {
        formatter(value) {
          if (!value) return ''
          if (/\s/.test(value)) {
            return value.split(/\s/).join('\n')
          }
          const n = 10
          let str = ''
          for (let i = 0; i < value.length; i++) {
            if (i % n == 0 && i > 0) {
              str += `${value[i]}\n`
            }
            str += value[i]
          }
          return str
        }
      }
    }
    const yAxis = {
      type: 'value'
    }
    // 横向柱状图
    if (this.element.value == 'bar' && this.element.sub == 'reverse') {
      this.options.xAxis = yAxis
      this.options.yAxis = xAxis
    } else {
      this.options.xAxis = xAxis
      this.options.yAxis = yAxis
    }
    return this.options
  }
}
