/**
 * Created by Zhang Haijun on 2018/6/8.
 */

import echarts from 'echarts';
import theme from './theme/walden';

export function getLinerColor (startColor, endColor) {
  // 只有一种颜色返回单色
  if (!endColor) return startColor
  return new echarts.graphic.LinearGradient(
    0, 0, 1, 1, [{
      offset: 0,
      color: startColor
    },
    {
      offset: 1,
      color: endColor
    }
    ]
  )
}

export default {
  props: {
    data: {
      type: null
    },
    setting: {
      type: Object,
      default: function () {
        return {
          fixed: 0
        };
      }
    },
    unit: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: 'chart'
    },
    dataZoom: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: () => {
        return new Date().getTime().toString() + Math.random()
      }
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '300px'
    },
    theme: {
      type: String
    }
  },
  data () {
    return {
      echarts,
      chart: null
    };
  },
  computed: {
    themeColor () {
      return {
        legendColor: '#fff',
        axisColor: '#ccc'
      };
    }
  },
  mounted () {
    this.initChart();
    window.addEventListener('resize', this.resize);
  },
  watch: {
    themeColor (newVal, oldVal) {
      if (newVal.legendColor === oldVal.legendColor) return;
      this.updateChart();
    },
    data: function () {
      this.updateChart();
    }
  },
  beforeDestroy () {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    initChart () {
      echarts.registerTheme('mytheme', theme);
      const target = document.getElementById(this.id);
      this.chart = echarts.init(target, 'mytheme', {
        devicePixelRatio: 1
        // renderer: 'svg'
      });
      this.updateChart();
    },
    resize () {
      if (this.chart) this.chart.resize();
    }
  }
};
