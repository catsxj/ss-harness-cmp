<template>
  <div class="wrapper">
    <section>
      <h4>基本配置</h4>
      <!-- <div>
        <span>内边距</span>
        <el-input type="number" v-model.number="style.padding"></el-input>
      </div> -->
      <!-- <div>
        <span>背景色</span>
        <el-color-picker v-model="style.backgroundColor" size="mini"></el-color-picker>
      </div> -->
      <div>
        <span>背景图片</span>
        <div class="backImage">
          <input type="file" name="file" id="fileUpload" @change="fileUploadChange" />
          <el-button type="primary">选择图片</el-button>
        </div>
      </div>
      <span v-if="fileBase" class="filename">
        <img :src="fileBase" alt="" />
        <i class="el-icon-remove-outline" @click="removeFile"></i>
      </span>
      <!-- <div>
        <span>圆角</span>
        <el-input type="number" v-model.number="style.borderRadius"></el-input>
      </div> -->
      <div>
        <span>阴影</span>
        <el-radio-group v-model="isShadow">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <span>边框</span>
        <el-radio-group v-model="isBorder" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <template v-if="isBorder">
        <div>
          <span>边框类型</span>
          <el-select v-model="style.borderStyle">
            <el-option v-for="item in borderTypes" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </div>
        <div>
          <span>边框大小</span>
          <el-input v-model.number="style.borderWidth" type="number"></el-input>
        </div>
        <div>
          <span>边框颜色</span>
          <el-color-picker v-model="style.borderColor" size="mini"></el-color-picker>
        </div>
      </template>
      <!-- <div>
        <span>是否导出</span>
        <el-radio-group v-model="style.isExport" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div> -->
    </section>
    <section v-if="getActiveElement.value == 'rect'">
      <h4>选项卡配置</h4>
      <!-- <div>
        <span>单位</span>
        <el-input v-model="options.title.unit"></el-input>
      </div> -->
      <div>
        <span>标题颜色</span>
        <el-color-picker v-model="options.title.color1" size="mini"></el-color-picker>
      </div>
      <div>
        <span>标题大小</span>
        <el-input type="number" v-model.number="options.title.fontSize1"></el-input>
      </div>
      <div>
        <span>标题粗细</span>
        <el-select v-model="options.title.fontWeight1">
          <el-option value="normal" label="标准"></el-option>
          <el-option value="bold" label="粗体"></el-option>
          <el-option value="bolder" label="偏粗"></el-option>
          <el-option value="lighter" label="偏细"></el-option>
        </el-select>
      </div>
      <div>
        <span>数值颜色</span>
        <el-color-picker v-model="options.title.color2" size="mini"></el-color-picker>
      </div>
      <div>
        <span>数值大小</span>
        <el-input type="number" v-model.number="options.title.fontSize2"></el-input>
      </div>
      <div>
        <span>数值粗细</span>
        <el-select v-model="options.title.fontWeight2">
          <el-option value="normal" label="标准"></el-option>
          <el-option value="bold" label="粗体"></el-option>
          <el-option value="bolder" label="偏粗"></el-option>
          <el-option value="lighter" label="偏细"></el-option>
        </el-select>
      </div>
    </section>
    <section v-if="getActiveElement.value == 'title'">
      <h4>标题卡配置</h4>
      <div>
        <span>标题颜色</span>
        <el-color-picker v-model="options.title.color" size="mini"></el-color-picker>
      </div>
      <div>
        <span>标题大小</span>
        <el-input type="number" v-model.number="options.title.fontSize"></el-input>
      </div>
      <div>
        <span>标题粗细</span>
        <el-select v-model="options.title.fontWeight">
          <el-option value="normal" label="标准"></el-option>
          <el-option value="bold" label="粗体"></el-option>
          <el-option value="bolder" label="偏粗"></el-option>
          <el-option value="lighter" label="偏细"></el-option>
        </el-select>
      </div>
    </section>
    <section v-if="getActiveElement.value == 'table'">
      <h4>表格配置</h4>
      <div>
        <span>标题</span>
        <el-input v-model="options.title.text"></el-input>
      </div>
      <div>
        <span>文字颜色</span>
        <el-color-picker size="mini" v-model="options.textStyle.color"></el-color-picker>
      </div>
    </section>
    <section v-if="echartsGroups.map(item => item.value).includes(getActiveElement.value)">
      <h4>图表配置</h4>
      <!-- <div>
        <span>主题</span>
        <div class="theme">
          <span v-for="item in Object.keys(themes)" :key="item" :class="options.theme == item ? 'active' : ''" @click="setTheme(item)">{{ item }}</span>
        </div>
      </div> -->
      <div>
        <span>标题</span>
        <el-input v-model="options.title.text"></el-input>
      </div>
      <div>
        <span>颜色</span>
        <el-color-picker size="mini" @change="setChartsColors"></el-color-picker>
      </div>
      <span class="colors">
        <span class="color-item" v-for="(color, index) in colors" :key="color + index" :style="{ backgroundColor: color }">
          <span class="color-mask" v-if="color != ''">
            <i class="el-icon-remove-outline" @click="removeColor(index)"></i>
          </span>
        </span>
      </span>
      <!-- <div>
        <span>文字颜色</span>
        <el-color-picker size="mini" v-model="options.textStyle.color"></el-color-picker>
      </div>
      <div>
        <span>文字大小</span>
        <el-input type="number" v-model.number="options.textStyle.fontSize"></el-input>
      </div> -->
      <div v-if="getActiveElement.value == 'bar'">
        <span>元素宽度</span>
        <el-input type="number" v-model.number="options.config.barWidth"></el-input>
      </div>
      <!-- <div v-if="getActiveElement.value == 'bar'">
        <span>堆叠</span>
        <el-radio-group v-model="options.config.stack" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div> -->
      <div v-if="getActiveElement.value == 'bar'">
        <span>显示顶部文字</span>
        <el-radio-group v-model="options.config.showLabel" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="getActiveElement.value == 'line'">
        <span>平滑曲线</span>
        <el-radio-group v-model="options.config.smooth" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="getActiveElement.value == 'pie'">
        <span>半圆</span>
        <el-radio-group v-model="options.config.isHalf" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="getActiveElement.value == 'pie'">
        <span>半径</span>
        <el-input type="number" v-model.number="options.config.radius[0]" style="width: 100px"></el-input>
        <el-input type="number" v-model.number="options.config.radius[1]" style="width: 100px" max="100"></el-input>
      </div>
      <div v-if="getActiveElement.value == 'pie'">
        <span>圆角</span>
        <el-radio-group v-model="options.config.isRadius" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="!['liquid-fill', 'gauge', 'map'].includes(getActiveElement.value)">
        <span>显示图例</span>
        <el-radio-group v-model="options.legend.show" size="mini">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="!['liquid-fill', 'gauge', 'map'].includes(getActiveElement.value)">
        <span>图例方向</span>
        <el-radio-group v-model="options.legend.orient" size="mini">
          <el-radio-button label="horizontal">水平</el-radio-button>
          <el-radio-button label="vertical">垂直</el-radio-button>
        </el-radio-group>
      </div>
      <template v-if="getActiveElement.value == 'liquid-fill'">
        <div>
          <span>水球背景色</span>
          <el-color-picker size="mini" v-model="options.config.liquidBackColor"></el-color-picker>
        </div>
        <div>
          <span>统计总量</span>
          <el-radio-group v-model="options.config.calcAll" size="mini">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </div>
        <div>
          <span>仅显示首项</span>
          <el-radio-group v-model="options.config.calcFirst" size="mini">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <template v-if="getActiveElement.value == 'map'">
        <div>
          <span>地图底色</span>
          <el-color-picker size="mini" v-model="options.config.mapColor"></el-color-picker>
        </div>
        <!-- <div>
          <span>高亮颜色</span>
          <el-color-picker size="mini" v-model="options.config.lightColor"></el-color-picker>
        </div> -->
        <div>
          <span>边界颜色</span>
          <el-color-picker size="mini" v-model="options.config.borderColor"></el-color-picker>
        </div>
        <div>
          <span>片段</span>
          <el-button type="primary" icon="el-icon-plus" circle size="small" style="transform: scale(0.8)" @click="openVisible"></el-button>
        </div>
        <span class="pieces">
          <table>
            <tr>
              <th>名称</th>
              <th>最小值</th>
              <th>最大值</th>
            </tr>
            <tr v-for="(item, index) in pieceList" :key="index">
              <td>{{ item.label }}</td>
              <td>{{ item.min }}</td>
              <td>{{ item.max }}</td>
            </tr>
          </table>
        </span>
      </template>
    </section>
    <el-dialog :visible.sync="visible" :append-to-body="true" :close-on-click-modal="false" title="添加片段">
      <el-button type="primary" icon="el-icon-plus" circle size="small" :disabled="!isComplete" style="margin: -20px 0 10px" @click="addPiece"></el-button>
      <el-table :data="pieceListCopy" border>
        <el-table-column label="名称">
          <template slot-scope="scope">
            <el-input v-model="scope.row.label"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="最小值">
          <template slot-scope="scope">
            <el-input type="number" v-model.number="scope.row.min"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="最大值">
          <template slot-scope="scope">
            <el-input type="number" v-model.number="scope.row.max"></el-input>
          </template>
        </el-table-column>
        <el-table-column width="100" label="操作">
          <template slot-scope="scope" v-if="scope.$index != 0">
            <el-button type="text">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmPieces">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { echartsGroups } from '../config'
import { $dom } from '../../utils'
import { cloneDeep } from 'lodash'
import { themes } from './theme'

const borderTypes = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '双线', value: 'double' },
  { label: '点状', value: 'dotted' }
]
export default {
  data() {
    return {
      style: {},
      file: {},
      isBorder: false,
      isShadow: false,
      borderTypes,
      echartsGroups,
      options: {
        title: {},
        legend: {
          textStyle: {}
        },
        config: {
          showLabel: false,
          stack: false,
          smooth: false,
          radius: [45, 70],
          isRadius: false,
          isHalf: false,
          liquidBackColor: '#e3f7ff',
          lightColor: '',
          borderColor: '',
          calcAll: false,
          calcFirst: false,
          mapColor: '#BCE5EB'
        },
        textStyle: {}
      },
      fileBase: '',
      colors: Array.from({ length: 10 }, v => ''),
      pieceList: [],
      pieceListCopy: [],
      visible: false,
      themes
    }
  },
  computed: {
    ...mapGetters(['getActiveElement']),
    isComplete() {
      const { length } = this.pieceListCopy
      return this.pieceListCopy[length - 1]?.label && (this.pieceListCopy[length - 1]?.min || this.pieceListCopy[length - 1]?.min == 0) && this.pieceListCopy[length - 1]?.max
    }
  },
  watch: {
    style: {
      handler(data) {
        const { uuid } = this.getActiveElement
        this.$store.commit('updateElementStyle', { uuid, style: { ...data } })
      },
      deep: true
    },
    options: {
      handler(data) {
        const { uuid } = this.getActiveElement
        this.$store.commit('updateElementOptions', { uuid, options: data })
      },
      deep: true
    },
    isBorder(val) {
      if (!val) {
        this.style.borderWidth = 0
        this.style.borderTypes = ''
        this.style.borderColor = ''
      } else {
        // this.style.borderWidth = 1
        this.$set(this.style, 'borderWidth', this.style.borderWidth || 1)
      }
    },
    isShadow(val) {
      this.$set(this.style, 'boxShadow', val ? '0 2px 12px 0 rgb(0 0 0 / 10%)' : 'none')
    },
    'options.legend.orient'(val) {
      if (val == 'horizontal') {
        this.options.legend.top = 'top'
      }
    }
  },
  mounted() {
    this.initStyleAddOptions()
    this.setTheme('dark')
  },
  methods: {
    initStyleAddOptions() {
      this.style = cloneDeep(this.getActiveElement.style)
      if (this.style.borderWidth) {
        this.isBorder = true
      }
      if (this.style.boxShadow && this.style.boxShadow !== 'none') {
        this.isShadow = true
      }
      if (this.style.backgroundImage) {
        const reg = /^url\('(.+)'\)$/
        reg.exec(this.style.backgroundImage)
        this.fileBase = RegExp.$1
      }
      this.options = { ...this.options, ...cloneDeep(this.getActiveElement.options) }
      if (this.options?.color) {
        const { color } = this.options
        for (let index = 0; index < color.length; index++) {
          this.$set(this.colors, index, color[index])
        }
      }
      this.options?.pieceList && (this.pieceList = cloneDeep(this.options.pieceList))
    },
    initOptions() {},
    fileUploadChange(evt) {
      const self = this
      this.file = evt.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(this.file)
      reader.onload = function (e) {
        self.fileBase = e.target.result
        Vue.set(self.style, 'backgroundImage', `url('${self.fileBase}')`)
        Vue.set(self.style, 'backgroundSize', '100% 100%')
      }
    },
    removeFile() {
      $dom('fileUpload').value = ''
      this.file = {}
      this.fileBase = ''
      Vue.set(this.style, 'backgroundImage', '')
    },
    setChartsColors(color) {
      let idx = this.colors.findIndex(item => !item)
      if (idx < 0) {
        idx = 9
      }
      this.$set(this.colors, idx, color)
      this.setOptionsColors()
    },
    removeColor(idx) {
      this.$set(this.colors, idx, '')
      this.setOptionsColors()
    },
    setOptionsColors() {
      this.$set(
        this.options,
        'color',
        this.colors.filter(item => item != '')
      )
    },
    openVisible() {
      this.visible = true
      this.pieceListCopy = cloneDeep(this.pieceList.length ? this.pieceList : [{ label: '', min: null, max: null }])
    },
    addPiece() {
      this.pieceListCopy.push({ label: '', min: null, max: null })
    },
    removePiece(index) {
      this.pieceList.splice(index, 1)
    },
    confirmPieces() {
      const { length } = this.pieceListCopy
      const { label, max, min } = this.pieceListCopy[length - 1]
      if (!label || (!min && min != 0) || !max) return this.$message.warning('请完善片段信息')
      this.pieceList = cloneDeep(this.pieceListCopy)
      this.$set(this.options, 'pieceList', this.pieceList)
      this.visible = false
    },
    setTheme(theme) {
      this.$set(this.options, 'theme', theme)
      this.$set(this.options.title, 'textStyle', themes[theme].options.textStyle)
      this.$set(this.options.legend, 'textStyle', themes[theme].options.textStyle)
      this.colors = themes[theme].options.color.filter((item, index) => index < 10)
      this.setOptionsColors()
      // this.style.backgroundColor = themes[theme].style.backgroundColor
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper section {
  h4 {
    margin: 5px 0;
    color: #fff;
  }
  & > div {
    padding: 5px 5px 5px 15px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    & > span {
      width: 100px !important;
      font-size: 12px;
    }
    & > .backImage {
      text-align: right;
      position: relative;
      #fileUpload {
        position: absolute;
        right: 0;
        top: 0;
        width: 100px;
        height: 100%;
        cursor: pointer;
        opacity: 0;
      }
    }
    & > div.theme {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      span {
        width: 40%;
        margin-right: 2%;
        margin-bottom: 5px;
        border: solid 1px var(--d-line-color);
        padding: 5px;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
      }
      span.active {
        color: #409eff;
        border: solid 1px #409eff;
      }
    }
  }
}
.filename {
  width: 100%;
  margin: 2px;
  padding: 0 5px;
  box-sizing: border-box;
  text-align: right;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 80%;
  }
  i {
    font-size: 24px;
    color: #ff0000;
    cursor: pointer;
  }
}
::v-deep .el-radio-button__inner {
  min-width: 60px;
}
.colors {
  display: flex;
  justify-content: space-around;
  padding: 5px;
  .color-item {
    width: 20px;
    height: 20px;
    border: solid 1px #eee;
    border-radius: 5px;
    cursor: pointer;
    position: relative;
    .color-mask {
      display: none;
    }
    &:hover {
      .color-mask {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        background: rgb(0, 0, 0, 0.5);
        text-align: center;
        i {
          color: #fff;
        }
      }
    }
  }
}
.pieces {
  width: 100%;
  table {
    width: 100%;
    border-collapse: collapse;
    th,
    td {
      border: solid 1px var(--d-line-color);
      font-weight: 100;
      text-align: center;
    }
  }
}
</style>
