<template>
  <section class="configure">
    <section class="left" :class="isExpandLeft ? 'expandLeft' : ''">
      <header>
        <span></span>
        <i :class="isExpandLeft ? 'fold' : 'unfold'" class="el-icon-s-fold" @click="$emit('update:isExpandLeft', !isExpandLeft)"></i>
      </header>
      <el-tabs v-model="activeName" v-show="isExpandLeft">
        <el-tab-pane label="字段" name="feild">
          <Feild :dragItem="dragItem" :widgetType="element.value" @onUpdate="onUpdate"></Feild>
        </el-tab-pane>
        <el-tab-pane label="样式" name="style">
          <Style />
        </el-tab-pane>
      </el-tabs>
    </section>
    <section class="right" :class="isExpandRight ? 'expandRight' : ''">
      <header>
        <span></span>
        <i :class="isExpandRight ? 'fold' : 'unfold'" class="el-icon-s-fold" @click="$emit('update:isExpandRight', !isExpandRight)"></i>
      </header>
      <el-tabs v-model="activeName1" v-show="isExpandRight">
        <el-tab-pane label="数据" name="data">
          <section class="scroll-box" v-if="element.value != 'input' && element.value != 'calendar'">
            <div>
              <el-select v-model="datasetId" placeholder="数据集" filterable>
                <el-option v-for="item in datasetList" :key="item.id" :value="item.id" :label="item.name"></el-option>
              </el-select>
            </div>
            <div class="box dimension">
              <h4>维度</h4>
              <div class="feilds">
                <p v-for="item in dimensionList" :key="item.id" draggable @dragstart="onDatasetDragStart(item)">{{ item.alias || item.name }}</p>
              </div>
            </div>
            <div class="box index">
              <h4>指标</h4>
              <div class="feilds">
                <p v-for="item in indexList" :key="item.id" draggable @dragstart="onDatasetDragStart(item)">{{ item.alias || item.name }}</p>
              </div>
            </div>
          </section>
        </el-tab-pane>
      </el-tabs>
    </section>
  </section>
</template>
<script>
import { getDataset, getFeildById } from '@/services/reportform/dataset'
import Feild from './feild.vue'
import Style from './style.vue'
import { eventBus } from '../eventBus'
export default {
  components: {
    Feild,
    Style
  },
  props: {
    element: {
      type: Object,
      default: () => ({})
    },
    isExpandLeft: {
      type: Boolean,
      default: true
    },
    isExpandRight: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeName: 'feild',
      activeName1: 'data',
      datasetId: '',
      datasetList: [],
      dimensionList: [],
      indexList: [],
      dragItem: {}
    }
  },
  watch: {
    datasetId(val) {
      if (val) {
        this.getDatasetInfos()
        const { datasetId, dropList } = this.element?.data
        if (datasetId && datasetId !== val) {
          this.$store.commit('updateElementData', { uuid: this.element.uuid, data: { datasetId: val, dropList: [] } })
          eventBus.$emit('clearFeildBox')
        } else {
          this.$store.commit('updateElementData', { uuid: this.element.uuid, data: { datasetId: val, dropList } })
        }
      } else {
        this.dimensionList = []
        this.indexList = []
      }
    }
  },
  mounted() {
    this.datasetId = this.element?.data?.datasetId
    this.getDatasets()
  },
  methods: {
    async getDatasets() {
      const { data, success } = await getDataset({ page: 1, rows: 999 })
      if (success) {
        this.datasetList = data.rows
      }
    },
    async getDatasetInfos() {
      const { data, success } = await getFeildById(this.datasetId)
      if (success) {
        this.dimensionList = data.filter(item => item.coordinate).filter(item => item.enable)
        this.indexList = data.filter(item => !item.coordinate).filter(item => item.enable)
      }
    },
    onDatasetDragStart(item) {
      this.dragItem = item
    },
    onUpdate() {
      this.$emit('onUpdate', this.datasetId)
    }
  }
}
</script>
<style lang="scss" scoped>
$expandLeftWidth: 280px;
$expandRightWidth: 160px;
$timing: 0.5s;
.configure {
  background: var(--d-header-color);
  border-left: solid 1px var(--d-line-color);
  display: flex;
  & > section {
    padding: 0 5px;
    box-sizing: border-box;
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: solid 1px var(--d-line-color);
    }
  }
  i {
    font-size: 24px;
    cursor: pointer;
  }
  .fold {
    transform: rotate(180deg);
    transition: transform #{$timing};
  }
  .unfold {
    transform: rotate(0deg);
    transition: transform #{$timing};
  }
  .left {
    width: 30px;
    border-right: solid 1px var(--d-line-color);
    transition: width #{$timing};
  }
  .expandLeft {
    width: $expandLeftWidth;
    transition: width #{$timing};
  }
  .right {
    width: 30px;
    transition: width #{$timing};
  }
  .expandRight {
    width: $expandRightWidth;
    transition: width #{$timing};
  }
  ::v-deep .el-input {
    background: var(--d-backgroundColor);
  }
}
.scroll-box {
  height: calc(100vh - 140px);
}
div.box {
  width: 100%;
  min-height: 320px;
  h4 {
    margin: 5px 0;
    color: #fff !important;
  }
  .feilds {
    height: 38vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  p {
    margin: 2px 0;
    padding: 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: solid 1px #eee;
    cursor: move;
  }
  &.dimension {
    p {
      border-color: rgb(29, 84, 213);
    }
  }
  &.index {
    p {
      border-color: rgb(0, 179, 116);
    }
  }
}
::v-deep .el-tabs__item {
  color: #fff;
  &.is-active {
    color: #1e54d5;
  }
}
::v-deep .el-tabs__nav-wrap::after {
  background-color: var(--d-line-color);
}
</style>
