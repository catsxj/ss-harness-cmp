/**
 * Created by HaijunZhang on 2018/12/18.
 */
import { Flow } from 'cmp-graph'

Flow.registerNode('base-node', {
  draw(item) {
    const group = item.getGraphicGroup()
    const model = item.getModel()
    const width = 184
    const height = 40
    const x = -width / 2
    const y = -height / 2
    const borderRadius = 4
    const keyShape = group.addShape('rect', {
      attrs: {
        x,
        y,
        width,
        height,
        radius: borderRadius,
        fill: 'white',
        stroke: '#CED4D9'
      }
    })
    // 左侧色条
    group.addShape('path', {
      attrs: {
        path: [
          ['M', x, y + borderRadius],
          ['L', x, y + height - borderRadius],
          ['A', borderRadius, borderRadius, 0, 0, 0, x + borderRadius, y + height],
          ['L', x + borderRadius, y],
          ['A', borderRadius, borderRadius, 0, 0, 0, x, y + borderRadius]
        ],
        fill: this.leftColor
      }
    })
    // 类型 logo
    group.addShape('image', {
      attrs: {
        img: this.icon,
        x: x + 10,
        y: y + 5,
        width: 30,
        height: 30
      }
    })
    // 名称文本
    const label = model.label
    group.addShape('text', {
      attrs: {
        text: label,
        x: x + 60,
        y: y + 15,
        textAlign: 'start',
        textBaseline: 'top',
        fill: 'rgba(0,0,0,0.65)'
      }
    })
    if (model.status) {
      group.addShape('image', {
        attrs: {
          img: `/web-common-resource/img/flow/${model.status}.png`,
          x: x + 158,
          y: y + 10,
          width: 20,
          height: 20,
          opacity: 1,
          rotate: 0
        }
      })
    }
    return keyShape
  },
  // 设置锚点
  anchor: [
    [0, 0.5],
    [1, 0.5],
    [0.5, 0],
    [0.5, 1]
  ]
})
Flow.registerNode(
  'audit-node',
  {
    leftColor: '#FAAD14',
    icon: '/web-common-resource/img/flow/audit.png'
  },
  'base-node'
)
Flow.registerNode(
  'fork-node',
  {
    leftColor: '#1890FF',
    icon: '/web-common-resource/img/flow/branch.png'
  },
  'base-node'
)
Flow.registerNode(
  'join-node',
  {
    leftColor: '#9254DE',
    icon: '/web-common-resource/img/flow/merge.png'
  },
  'base-node'
)
