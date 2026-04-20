const ECHARTS = 'echarts'
const MEDIA = 'media'
const FORM = 'form'
export const $ = id => document.getElementById(id)

export const gridNumber = 12

const echartsGroups = [
  {
    label: '柱状图',
    value: 'bar',
    icon: require('@/assets/designer/chart-bar.png')
  },
  {
    label: '柱状图（堆叠）',
    value: 'bar',
    sub: 'stack',
    icon: require('@/assets/designer/chart-bar.png')
  },
  {
    label: '柱状图（横向）',
    value: 'bar',
    sub: 'reverse',
    icon: require('@/assets/designer/bar-reverse.png')
  },
  {
    label: '折线图',
    value: 'line',
    icon: require('@/assets/designer/chart-line.png')
  },
  {
    label: '折线图（面积）',
    value: 'line',
    sub: 'area',
    icon: require('@/assets/designer/chart-line.png')
  },
  {
    label: '折线图（堆叠面积）',
    value: 'line',
    sub: 'stack-area',
    icon: require('@/assets/designer/chart-line.png')
  },
  {
    label: '饼状图',
    value: 'pie',
    icon: require('@/assets/designer/chart-pie-alt.png')
  },
  {
    label: '饼状图（玫瑰）',
    value: 'pie',
    sub: 'rose',
    icon: require('@/assets/designer/chart-pie-alt.png')
  },
  {
    label: '水球图',
    value: 'liquid-fill',
    icon: require('@/assets/designer/liquid-fill.png')
  },
  {
    label: '仪表盘',
    value: 'gauge',
    icon: require('@/assets/designer/gauge.png')
  },
  {
    label: '地图',
    value: 'map',
    icon: require('@/assets/designer/map.png')
  },
  {
    label: '地图(散点)',
    value: 'map',
    sub: 'scatter',
    icon: require('@/assets/designer/map-scatter.png')
  }
]

const formGroups = [
  {
    label: '表格',
    value: 'table',
    icon: require('@/assets/designer/table.png')
  },
  {
    label: '输入框',
    value: 'input',
    icon: require('@/assets/designer/input.png')
  },
  {
    label: '选择框',
    value: 'select',
    icon: require('@/assets/designer/select.png')
  },
  {
    label: '日历',
    value: 'calendar',
    icon: require('@/assets/designer/calendar.png')
  }
]

const mediaGroups = [
  {
    label: '标题卡',
    value: 'title',
    icon: require('@/assets/designer/title.png')
  },
  {
    label: '标签卡',
    value: 'rect',
    icon: require('@/assets/designer/rect.png')
  }
]

function setAttrsToGroup(groups, type) {
  groups.forEach(item => {
    item.type = type
    item.style = {
      backgroundColor: '',
      boxSizing: 'border-box',
      overflow: 'auto',
      height: '100%'
    }
    item.x = 0
    item.y = 0
    item.w = 6
    item.h = 6
    if (computeSearch(item.value)) {
      item.w = 3
      item.h = 2
    }
    item.data = {
      datasetId: null,
      dropList: []
    }
    item.options = {
      title: {
        text: '',
        color: '#fff',
        fontSize: 14,
        fontWeight: 'normal'
      }
    }
    if (type == ECHARTS) {
      item.options = {
        grid: {
          width: 'auto',
          top: '36',
          left: '10',
          right: '10',
          bottom: '10',
          containLabel: true
        },
        title: {
          text: '',
          textStyle: {
            fontSize: 14,
            fontWeight: 500
          }
        },
        legend: {
          show: true,
          type: 'scroll',
          orient: 'horizontal',
          textStyle: {
            width: 100,
            overflow: 'break'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}'
        },
        color: [],
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              show: true,
              name: '',
              title: ''
            }
          },
          z: 2,
          top: 'top',
          right: 'right'
        }
      }
    }
  })
}

export const computeEcharts = widgetType => echartsGroups.map(item => item.value).includes(widgetType)
export const computeSearch = widgetType => formGroups.map(item => item.value).includes(widgetType) && widgetType !== 'table'
export const computeTable = widgetType => widgetType == 'table'
export const computeSelect = widgetType => widgetType == 'select'

setAttrsToGroup(echartsGroups, ECHARTS)
setAttrsToGroup(formGroups, FORM)
setAttrsToGroup(mediaGroups, MEDIA)

export { echartsGroups, formGroups, mediaGroups }
