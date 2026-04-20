<template>
  <section class="wrapper">
    <header class="wrapper-header">
      <div class="function-items">
        <img src="@/assets/designer/back.png" alt="" @click="toPanel" />
        <!-- <img src="@/assets/designer/theme.png" alt="" style="width: 32px" @click="changeTheme" /> -->
        <el-input v-model="detail.name" placeholder="请输入仪表板名称"></el-input>
      </div>
      <div>
        <el-button @click="preview" style="border: solid 1px #1e54d5; color: #1e54d5">预览</el-button>
        <el-button type="primary" @click="save('copy')" v-if="$route.query.uuid">另存为</el-button>
        <el-button type="primary" @click="save()">保存</el-button>
      </div>
    </header>
    <div class="designer-region">
      <section class="designer-box" id="designer-box">
        <header class="designer-box-header">
          <div>
            <template v-for="(group, index) in [formGroups, echartsGroups, mediaGroups]">
              <div :key="index" class="group">
                <template v-for="item in group">
                  <el-tooltip :key="item.value + item.sub" :content="item.label" placement="top">
                    <div class="icon-item" draggable @dragstart="onDragStart(item)">
                      <img :src="item.icon" :style="{ filter: isDark ? '' : 'grayscale(100%)' }" alt="" />
                    </div>
                  </el-tooltip>
                </template>
              </div>
            </template>
          </div>
          <div>
            <span>{{ (scale * 100).toFixed(0) + '%' }}</span>
            <i class="el-icon-zoom-in" @click="changeZoom('+')"></i>
            <i class="el-icon-zoom-out" @click="changeZoom('-')"></i>
            <i class="el-icon-setting" @click="openGlobal"></i>
          </div>
        </header>
        <div id="designer-global" class="designer-box-region" @drop="onDrop" @dragover="onDragover" :style="{ ...globalOptions }" @click="onClickCanvas">
          <grid-layout
            :layout="getElementLists"
            :col-num="gridNumber"
            :row-height="32"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
            :style="{ transform: `scale(${scale}`, transformOrigin: '50% 0 0' }"
          >
            <template v-for="element in getElementLists">
              <grid-item
                class="grid-item"
                :key="element.uuid"
                :i="element.i"
                :x="element.x"
                :y="element.y"
                :w="element.w"
                :h="element.h"
                @resized="onActivedResize(element, $event)"
                v-if="element.uuid"
              >
                <div
                  :id="element.style.backgroundColor"
                  :style="{ backgroundColor: element.style.backgroundColor, borderRadius: globalOptions.radius, height: '100%' }"
                  @click.stop="onActivated(element, $event)"
                  :class="activeElement.uuid == element.uuid ? 'active' : ''"
                >
                  <component :is="`widget-${element.value}`" :element="element" v-if="element.value" :isEdit="true" :ref="`component${element.uuid}`"></component>
                  <el-dropdown @command="handleCommand($event, element)" class="dropdown">
                    <span class="el-dropdown-link">
                      <i class="el-icon-more"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </grid-item>
            </template>
          </grid-layout>
        </div>
      </section>
      <template v-for="item in elementLists">
        <configs-component
          :key="item.uuid"
          :element="activeElement"
          v-if="item.uuid == activeElement.uuid"
          :isExpandLeft.sync="isExpandLeft"
          :isExpandRight.sync="isExpandRight"
          @onUpdate="onUpdate"
        ></configs-component>
      </template>
      <configs-global v-if="!activeElement.uuid && uuidWithGlobal"></configs-global>
    </div>
    <FullScreen :visible.sync="visible" :backgroundColor="globalOptions.backgroundColor">
      <ComponentWrapper :elementLists="getElementLists" :globalOptions="globalOptions"></ComponentWrapper>
    </FullScreen>
  </section>
</template>
<script>
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
import { v4 as uuidv4 } from 'uuid'
import { mapState, mapGetters } from 'vuex'
import { formGroups, echartsGroups, mediaGroups, gridNumber } from './config.js'
import { renderWidgets } from './widgets/widgets'
import FullScreen from '../components/fullscreen.vue'
import ComponentWrapper from './tools/componentWrapper.vue'
import { createPanel, updatePanel, getPanelDetail } from '@/services/reportform/designer'
import ConfigsGlobal from './dashboard/configs-global.vue'
import ConfigsComponent from './dashboard/configs-component.vue'

import VueGridLayout from 'vue-grid-layout'
const GridLayout = VueGridLayout.GridLayout
const GridItem = VueGridLayout.GridItem

renderWidgets()

export default {
  components: {
    ConfigsGlobal,
    ConfigsComponent,
    FullScreen,
    ComponentWrapper,
    GridLayout,
    GridItem
  },
  data() {
    return {
      formGroups,
      echartsGroups,
      mediaGroups,
      activeElement: {},
      datasetId: '',
      isExpandLeft: true,
      isExpandRight: true,
      visible: false,
      detail: {},
      scale: 1,
      areaStyle: {},
      file: {},
      isDark: true,
      gridNumber
    }
  },
  watch: {
    'activeElement.uuid'(data) {
      this.$store.commit('updateActiveElement', data)
    }
  },
  computed: {
    ...mapState({
      // uuid为空代表已删除
      elementLists: state => state.elements.elementLists,
      globalOptions: state => state.elements.globalOptions
    }),
    ...mapGetters(['getElementLists']),
    uuidWithGlobal() {
      if (this.$route.query.uuid) {
        return Object.keys(this.globalOptions).length
      }
      return true
    }
  },
  mounted() {
    this.initElements()
  },
  methods: {
    async initElements() {
      const { uuid } = this.$route.query
      if (uuid) {
        const { data } = await getPanelDetail(uuid)
        this.detail = data
        const { elementLists, global } = JSON.parse(data.content)
        this.$store.commit('initElementLists', elementLists)
        this.$store.commit('updateGlobalOptions', global)
        setTimeout(() => {
          this.elementLists.forEach(element => {
            const componentRef = this.$refs[`component${element.uuid}`]
            componentRef && componentRef.length && componentRef[0].getList && componentRef[0].getList()
          })
        }, 300)
      } else {
        this.$store.commit('initElementLists', [])
      }
    },
    // 开始拖曳，确定ACTIVE组件
    onDragStart(item) {
      const { length } = this.getElementLists
      if (!length) {
        return (this.activeElement = { ...item })
      }
      const { x: lastX, h: lastH } = this.getElementLists[length - 1]
      this.activeElement = { ...item, x: lastX + lastH > gridNumber / 2 ? 0 : gridNumber / 2 }
    },
    onDrop() {
      const { uuid } = this.activeElement
      if (uuid) return
      const { length } = this.elementLists
      this.activeElement = { ...this.activeElement, uuid: uuidv4(), i: length ? this.elementLists[length - 1].i + 1 : 1 }
      this.$store.commit('createElement', this.activeElement)
    },
    onDragover(evt) {
      evt.preventDefault()
    },
    onClickCanvas(evt) {
      const { id } = evt.target
      if (id == 'designer-global') this.activeElement = {}
    },
    onActivated(item) {
      this.activeElement = item
    },
    onDeactivated() {
      this.activeElement = {}
    },
    onActivedResize(element, evt) {
      this.activeElement = element
    },
    handleCommand(command, item) {
      switch (command) {
        case 'delete':
          this.$store.commit('deleteElement', { uuid: item.uuid, value: item.value })
          if (item.uuid == this.activeElement.uuid) {
            this.activeElement = {}
          }
          break
      }
    },
    preview() {
      if (this.getElementLists.filter(element => !['title', 'input', 'calendar', ''].includes(element.value)).filter(element => !element.data?.dropList?.length).length > 0) {
        return this.$message.warning('含有未绑定字段的组件，无法预览')
      }
      this.visible = true
    },
    async save(copy) {
      if (!this.detail.name) {
        return this.$message.warning('请输入仪表板名称')
      }
      if (this.getElementLists.filter(element => !['title', 'input', 'calendar', ''].includes(element.value)).filter(element => !element.data?.dropList?.length).length > 0) {
        return this.$message.warning('含有未绑定字段的组件，无法保存')
      }
      const params = {
        name: this.detail.name,
        content: JSON.stringify({ elementLists: this.elementLists.filter(item => item.uuid), global: this.globalOptions })
      }
      const { id } = this.detail
      const fn = copy || !id ? createPanel : updatePanel
      const { success, message, data } = await fn(params, id)
      if (success) {
        this.$message.success(message)
        if (fn == createPanel) {
          this.$router.push('/designer?uuid=' + data.uuid)
        }
      }
    },

    changeZoom(sign) {
      if (sign == '+' && this.scale != 1) {
        this.scale += 0.2
      }
      if (sign == '-' && this.scale.toFixed(1) != 0.2) {
        this.scale -= 0.2
      }
    },
    openGlobal() {
      this.activeElement = {}
    },
    toPanel() {
      // this.$router.push('/soa/report/panel')
      const { hostname, protocol } = window.location
      const port = 60006
      if (hostname == 'localhost') {
        return this.$router.replace('/report/panel')
      }
      window.location.href = `${protocol}//${hostname}:${port}/aos-web/report/panel`
    },
    onUpdate(datasetId) {
      this.datasetId = datasetId
      setTimeout(() => {
        this.$refs[`component${this.activeElement.uuid}`][0].getList && this.$refs[`component${this.activeElement.uuid}`][0].getList()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';
$headerHeight: 46px;
.wrapper {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  z-index: 99;
  color: #fff;
  & > header {
    width: 100%;
    height: $headerHeight;
    padding: 0 10px;
    box-sizing: border-box;
    background: var(--d-backgroundColor);
    border-bottom: solid 1px var(--d-line-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .function-items {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    img {
      width: 28px;
      margin-right: 10px;
      cursor: pointer;
    }
  }
}
.designer-region {
  width: 100%;
  height: calc(100% - #{$headerHeight});
  display: flex;
  .designer-box {
    flex-grow: 1;
  }
}
.designer-box header {
  display: flex;
  background-color: var(--d-header-color);
  justify-content: space-between;
  & > div {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: $headerHeight;
    .group {
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: solid 1px #1296db;
      padding: 0 10px;
      & > div {
        margin: 5px;
        cursor: move;
        img {
          width: 20px;
        }
        p {
          margin: 0;
        }
      }
    }
    ::v-deep i[class^='el-icon-zoom'],
    ::v-deep i[class^='el-icon-setting'] {
      margin: 0 4px;
      font-size: 24px;
      cursor: pointer;
    }
  }
}
.designer-box-region {
  width: 100%;
  height: calc(100% - #{$headerHeight});
  background: var(--d-canvas-color);
  overflow: auto;
  overflow-x: hidden;
}
// ::v-deep .draggable:not(.active) {
//   border: none;
// }
// ::v-deep .draggable.active {
//   cursor: move;
// }
// ::v-deep .vdr {
//   border: solid 1px #59c7f9;
// }

.el-dropdown-link {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #59c7f9;
  & > i {
    font-size: 24px;
  }
}
// .global ::v-deep .el-input__inner {
//   background-color: var(--d-backgroundColor);
//   color: var(--d-text-color);
// }
.wrapper > header ::v-deep .el-input__inner {
  background-color: var(--d-backgroundColor);
  color: #fff;
  border: solid 1px var(--d-line-color);
}
::v-deep .grid-item {
  touch-action: none;
  box-sizing: border-box;
  .dropdown {
    position: absolute;
    right: 10px;
    top: 3px;
    cursor: pointer;
    display: none;
  }
  &:hover {
    .dropdown {
      display: block;
    }
  }
}

.active {
  border: solid 1px #59c7f9;
  box-shadow: #59c7f9 0px 0px 10px;
}
::v-deep .noData {
  width: 100%;
  height: 100%;
  text-align: center;
  img {
    width: 60%;
    height: 60%;
    margin-top: 10%;
  }
  p {
    color: var(--d-text-color);
  }
}
</style>
