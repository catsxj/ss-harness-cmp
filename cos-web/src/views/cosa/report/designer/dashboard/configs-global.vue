<template>
  <section class="global" id="global">
    <Collapse title="主题配置">
      <div class="options-list">
        <span>主题</span>
        <el-radio-group :value="global.theme" @input="openConfirm">
          <el-radio v-for="item in Object.keys(themes)" :key="item" :label="item">{{ themes[item].name }}</el-radio>
        </el-radio-group>
      </div>
    </Collapse>
    <Collapse title="背景配置">
      <div class="options-list">
        <span>背景色</span>
        <el-color-picker v-model="global.backgroundColor" size="mini"></el-color-picker>
      </div>
      <div class="options-list">
        <span>背景图片</span>
        <div>
          <input type="file" name="file" id="fileUpload" @change="fileUploadChange" />
          <el-button>选择图片</el-button>
        </div>
      </div>
      <span v-if="fileBase" class="filename">
        <img :src="fileBase" alt="" />
        <i class="el-icon-remove-outline" @click="removeFile"></i> </span
    ></Collapse>
    <Collapse title="组件配置">
      <div class="options-list">
        <span>卡片背景色</span>
        <el-color-picker v-model="global.elementBackgroundColor" size="mini"></el-color-picker>
      </div>
      <div class="options-list">
        <span>卡片内边距</span>
        <el-input type="number" v-model.number="global.elementPadding"></el-input>
      </div>
      <div class="options-list">
        <span>卡片圆角</span>
        <el-radio-group v-model="global.radius">
          <el-radio v-for="item in radiusData" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </div>
    </Collapse>
  </section>
</template>
<script>
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import Collapse from './collapse.vue'
import { $dom } from '../../utils/index'
import { themes } from './theme'
import { cloneDeep } from 'lodash'
const radiusData = [
  { label: '无', value: '0px' },
  { label: '小', value: '5px' },
  { label: '大', value: '10px' }
]
export default {
  components: {
    Collapse
  },
  data() {
    return {
      themes,
      global: {},
      radiusData,
      fileBase: ''
    }
  },
  watch: {
    global: {
      handler(data) {
        this.$store.commit('updateGlobalOptions', { ...data })
      },
      deep: true
    }
  },
  computed: {
    ...mapState({
      globalOptions: state => state.elements.globalOptions
    }),
    ...mapGetters(['getGlobalOptions'])
  },
  mounted() {
    this.initGlobalOptions()
  },
  methods: {
    initGlobalOptions() {
      if (!Object.keys(this.globalOptions).length && !this.$route.query.uuid) {
        return (this.global = {
          theme: 'dark',
          radius: '0px',
          elementBackgroundColor: '#121D43',
          backgroundColor: '#0b1532',
          elementPadding: 5,
          textColor: '#fff'
        })
      }
      this.global = cloneDeep(this.globalOptions)
      if (this.global.backgroundImage) {
        const reg = /^url\('(.+)'\)$/
        reg.exec(this.global.backgroundImage)
        this.fileBase = RegExp.$1
      }
      document.body.style.setProperty('--d-text-color', this.global.theme == 'dark' ? '#fff' : '#393b3e')
      document.body.style.setProperty('--d-th-backgroundColor', this.global.theme == 'dark' ? 'transparent' : '#f7f7f7')
    },
    fileUploadChange(evt) {
      const self = this
      this.file = evt.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(this.file)
      reader.onload = function (e) {
        self.fileBase = e.target.result
        Vue.set(self.global, 'backgroundImage', `url('${self.fileBase}')`)
        Vue.set(self.global, 'backgroundSize', '100% 100%')
      }
    },
    removeFile() {
      $dom('fileUpload').value = ''
      this.file = {}
      this.fileBase = ''
      Vue.set(this.global, 'backgroundImage', '')
    },
    openConfirm(data) {
      this.$confirm('主题切换后，原有自定义样式将无法恢复，建议切换前手动另存为副本', '主题切换', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        if (!this.themes[data]) return
        this.global.theme = data
        this.global.backgroundColor = this.themes[data].style.backgroundColor
        this.global.elementBackgroundColor = this.themes[data].options.backgroundColor
        this.global.textColor = this.themes[data].options.textStyle.color
        // this.$store.commit('restoreAllElementsStyle')
        document.body.style.setProperty('--d-text-color', data == 'dark' ? '#fff' : '#393b3e')
        document.body.style.setProperty('--d-th-backgroundColor', data == 'dark' ? 'transparent' : '#f7f7f7')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.global {
  background: var(--d-header-color);
  border-left: solid 1px var(--d-line-color);
  width: 440px;
  h4 {
    margin: 5px 0;
    color: #fff !important;
  }
  .models {
    & > div {
      padding: 5px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      & > span {
        width: 100px !important;
      }
    }
  }
}
.filename {
  width: 50%;
  margin: 2px auto;
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
</style>
