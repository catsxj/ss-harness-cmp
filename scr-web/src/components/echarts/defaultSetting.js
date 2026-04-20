export const legend = {
  type: 'scroll',
  itemWidth: 12,
  itemHeight: 12,
  icon: 'roundRect',
  padding: [0, 20],
  textStyle: {
    color: '##999999'
  }
};
export const grid = {
  left: 1,
  right: 1,
  top: 30,
  bottom: 1,
  containLabel: true
};
export const yAxis = {
  type: 'value',
  nameGap: 5,
  min: 0,
  splitLine: {
    lineStyle: {
      color: ['#ebebeb'],
      type: 'dashed'
    }
  },
  axisLine: {
    lineStyle: {
      color: ['#d9d9d9']
    }
  },
  axisTick: {
    show: false
  }
};
export const xAxis = {
  axisLine: {
    lineStyle: {
      color: ['#d9d9d9']
    }
  },
  axisTick: {
    show: false
  }
};
export const toolbox = {
  feature: {
    saveAsImage: {}
  }
};
