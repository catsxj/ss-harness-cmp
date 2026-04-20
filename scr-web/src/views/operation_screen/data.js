export const overviewConfigs = [{
  title: '常规作业',
  icon: 'el-icon-monitor',
  type: 'COUNT',
  data: [{
    title: '已发布',
    className: 'lgreen',
    unit: '个',
    value: 0
  }, {
    title: '开发中',
    className: 'green',
    unit: '个',
    value: 0
  }, {
    title: '审批中',
    className: 'purple',
    unit: '个',
    value: 0
  }]
}, {
  title: '定时作业',
  icon: 'el-icon-time',
  type: 'COUNT',
  data: [{
    title: '未激活',
    className: 'lgreen',
    unit: '个',
    value: 0
  }, {
    title: '已激活',
    className: 'green',
    unit: '个',
    value: 0
  }, {
    title: '暂停中',
    className: 'purple',
    unit: '个',
    value: 0
  }]
}]
