<template>
  <div class="vue-image-crop-upload" v-show="modelValue">
    <div class="vicp-wrap">
      <div class="vicp-close" @click="off">
        <i class="vicp-icon4"></i>
      </div>
      <div class="vicp-step1" v-show="step == 1">
        <div class="vicp-drop-area" @dragleave="preventDefault" @dragover="preventDefault" @dragenter="preventDefault" @click="handleClick" @drop="handleChange">
          <i class="vicp-icon1" v-show="loading != 1">
            <i class="vicp-icon1-arrow"></i>
            <i class="vicp-icon1-body"></i>
            <i class="vicp-icon1-bottom"></i>
          </i>
          <span class="vicp-hint" v-show="loading !== 1">{{ lang.hint }}</span>
          <span class="vicp-no-supported-hint" v-show="!isSupported">{{ lang.noSupported }}</span>
          <input type="file" v-show="false" v-if="step == 1" @change="handleChange" ref="fileinput" />
        </div>
        <div class="vicp-error" v-show="hasError"><i class="vicp-icon2"></i> {{ errorMsg }}</div>
        <div class="vicp-operate">
          <a @click="off" @mousedown="ripple">{{ lang.btn.off }}</a>
        </div>
      </div>

      <div class="vicp-step2" v-if="step == 2">
        <div class="vicp-crop">
          <div class="vicp-crop-left" v-show="true">
            <div class="vicp-img-container">
              <img
                :src="sourceImgUrl"
                :style="sourceImgStyle"
                class="vicp-img"
                draggable="false"
                @drag="preventDefault"
                @dragstart="preventDefault"
                @dragend="preventDefault"
                @dragleave="preventDefault"
                @dragover="preventDefault"
                @dragenter="preventDefault"
                @drop="preventDefault"
                @touchstart="imgStartMove"
                @touchmove="imgMove"
                @touchend="createImg"
                @touchcancel="createImg"
                @mousedown="imgStartMove"
                @mousemove="imgMove"
                @mouseup="createImg"
                @mouseout="createImg"
                ref="imgRef"
              />
              <div class="vicp-img-shade vicp-img-shade-1" :style="sourceImgShadeStyle"></div>
              <div class="vicp-img-shade vicp-img-shade-2" :style="sourceImgShadeStyle"></div>
            </div>

            <div class="vicp-range">
              <input type="range" :value="scale.range" step="1" min="0" max="100" @change="zoomChange" />
              <i @mousedown="startZoomSub" @mouseout="endZoomSub" @mouseup="endZoomSub" class="vicp-icon5"></i>
              <i @mousedown="startZoomAdd" @mouseout="endZoomAdd" @mouseup="endZoomAdd" class="vicp-icon6"></i>
            </div>

            <div class="vicp-rotate" v-if="!noRotate">
              <i @click="rotateImg">↻</i>
            </div>
          </div>
          <div class="vicp-crop-right" v-show="true">
            <div class="vicp-preview">
              <div class="vicp-preview-item" v-if="!noSquare">
                <img :src="createImgUrl" :style="previewStyle" />
                <span>{{ lang.preview }}</span>
              </div>
              <div class="vicp-preview-item vicp-preview-item-circle" v-if="!noCircle">
                <img :src="createImgUrl" :style="previewStyle" />
                <span>{{ lang.preview }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="vicp-operate">
          <a @click="setStep(1)" @mousedown="ripple">{{ lang.btn.back }}</a>
          <a class="vicp-operate-btn" @click="prepareUpload" @mousedown="ripple">{{ lang.btn.save }}</a>
        </div>
      </div>

      <div class="vicp-step3" v-if="step == 3">
        <div class="vicp-upload">
          <span class="vicp-loading" v-show="loading === 1">{{ lang.loading }}</span>
          <div class="vicp-progress-wrap">
            <span class="vicp-progress" v-show="loading === 1" :style="progressStyle"></span>
          </div>
          <div class="vicp-error" v-show="hasError"><i class="vicp-icon2"></i> {{ errorMsg }}</div>
          <div class="vicp-success" v-show="loading === 2"><i class="vicp-icon3"></i> {{ lang.success }}</div>
        </div>
        <div class="vicp-operate">
          <a @click="setStep(2)" @mousedown="ripple">{{ lang.btn.back }}</a>
          <a @click="off" @mousedown="ripple">{{ lang.btn.close }}</a>
        </div>
      </div>
      <canvas v-show="false" :width="width" :height="height" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
import { ref, reactive, computed, watch, onMounted } from 'vue'
import language from './utils/language.js'
import mimes from './utils/mimes.js'
import data2blob from './utils/data2blob.js'
import effectRipple from './utils/effectRipple.js'

// TODO: type - image-cropper 内部结构较复杂，lang 等来自 JS 工具函数，暂以宽松类型处理
const props = withDefaults(
  defineProps<{
    field?: string
    ki?: string | number
    modelValue?: boolean
    url?: string
    params?: Record<string, any> | null
    headers?: Record<string, any> | null
    width?: number
    height?: number
    noRotate?: boolean
    noCircle?: boolean
    noSquare?: boolean
    maxSize?: number
    langType?: string
    langExt?: Record<string, any> | null
    imgFormat?: string
    imgBgc?: string
    withCredentials?: boolean
  }>(),
  {
    field: 'avatar',
    ki: 0,
    modelValue: true,
    url: '',
    params: null,
    headers: null,
    width: 200,
    height: 200,
    noRotate: true,
    noCircle: false,
    noSquare: false,
    maxSize: 10240,
    langType: 'zh',
    langExt: null,
    imgFormat: 'png',
    imgBgc: '#fff',
    withCredentials: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'crop-success': [createImgUrl: string, field: string, ki: string | number]
  'crop-upload-success': [resData: any, field: string, ki: string | number]
  'crop-upload-fail': [sts: any, field: string, ki: string | number]
}>()

const allowImgFormat = ['jpg', 'png']
const tempImgFormat = allowImgFormat.indexOf(props.imgFormat) === -1 ? 'jpg' : props.imgFormat
const lang: any = language[props.langType] ? language[props.langType] : language.en
const mime = (mimes as any)[tempImgFormat]

if (props.langExt) {
  Object.assign(lang, props.langExt)
}

const isSupported = ref(typeof FormData === 'function')
// eslint-disable-next-line no-prototype-builtins
const isSupportTouch = document.hasOwnProperty('ontouchstart')

const step = ref(1)
const loading = ref(0)
const progress = ref(0)
const hasError = ref(false)
const errorMsg = ref('')
const ratio = props.width / props.height

const sourceImg = ref<HTMLImageElement | null>(null)
const sourceImgUrl = ref<any>('')
const createImgUrl = ref('')

const sourceImgMouseDown = reactive({
  on: false,
  mX: 0,
  mY: 0,
  x: 0,
  y: 0
})

const previewContainer = {
  width: 100,
  height: 100
}

const sourceImgContainer = {
  width: 240,
  height: 184
}

const scale = reactive({
  zoomAddOn: false,
  zoomSubOn: false,
  range: 1,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  maxWidth: 0,
  maxHeight: 0,
  minWidth: 0,
  minHeight: 0,
  naturalWidth: 0,
  naturalHeight: 0
})

const fileinput = ref<HTMLInputElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const progressStyle = computed(() => ({
  width: progress.value + '%'
}))

const sourceImgMasking = computed(() => {
  const sic = sourceImgContainer
  const sicRatio = sic.width / sic.height
  let x = 0,
    y = 0,
    w = sic.width,
    h = sic.height,
    s = 1
  if (ratio < sicRatio) {
    s = sic.height / props.height
    w = sic.height * ratio
    x = (sic.width - w) / 2
  }
  if (ratio > sicRatio) {
    s = sic.width / props.width
    h = sic.width / ratio
    y = (sic.height - h) / 2
  }
  return {
    scale: s,
    x,
    y,
    width: w,
    height: h
  }
})

const sourceImgStyle = computed(() => {
  const sim = sourceImgMasking.value
  const top = scale.y + sim.y + 'px'
  const left = scale.x + sim.x + 'px'
  return {
    top,
    left,
    width: scale.width + 'px',
    height: scale.height + 'px'
  }
})

const sourceImgShadeStyle = computed(() => {
  const sic = sourceImgContainer
  const sim = sourceImgMasking.value
  const w = sim.width == sic.width ? sim.width : (sic.width - sim.width) / 2
  const h = sim.height == sic.height ? sim.height : (sic.height - sim.height) / 2
  return {
    width: w + 'px',
    height: h + 'px'
  }
})

const previewStyle = computed(() => {
  const pc = previewContainer
  let w = pc.width
  let h = pc.height
  const pcRatio = w / h
  if (ratio < pcRatio) {
    w = pc.height * ratio
  }
  if (ratio > pcRatio) {
    h = pc.width / ratio
  }
  return {
    width: w + 'px',
    height: h + 'px'
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && loading.value != 1) {
      reset()
    }
  }
)

// 点击波纹效果
const ripple = (e: MouseEvent) => {
  effectRipple(e)
}

// 关闭控件
const off = () => {
  setTimeout(() => {
    emit('update:modelValue', false)
    if (step.value == 3 && loading.value == 2) {
      setStep(1)
    }
  }, 200)
}

const setStep = (no: number) => {
  setTimeout(() => {
    step.value = no
  }, 200)
}

const preventDefault = (e: Event) => {
  e.preventDefault()
  return false
}

const handleClick = (e: MouseEvent) => {
  if (loading.value !== 1) {
    if (e.target !== fileinput.value) {
      e.preventDefault()
      if (document.activeElement !== (fileinput.value as any)) {
        fileinput.value?.click()
      }
    }
  }
}

const handleChange = (e: any) => {
  e.preventDefault()
  if (loading.value !== 1) {
    const files = e.target.files || e.dataTransfer.files
    reset()
    if (checkFile(files[0])) {
      setSourceImg(files[0])
    }
  }
}

const checkFile = (file: File) => {
  if (file.type.indexOf('image') === -1) {
    hasError.value = true
    errorMsg.value = lang.error.onlyImg
    return false
  }
  if (file.size / 1024 > props.maxSize) {
    hasError.value = true
    errorMsg.value = lang.error.outOfSize + props.maxSize + 'kb'
    return false
  }
  return true
}

const reset = () => {
  loading.value = 0
  hasError.value = false
  errorMsg.value = ''
  progress.value = 0
}

const setSourceImg = (file: File) => {
  const fr = new FileReader()
  fr.onload = function () {
    sourceImgUrl.value = fr.result
    startCrop()
  }
  fr.readAsDataURL(file)
}

const startCrop = () => {
  const sim = sourceImgMasking.value
  const img = new Image()
  img.src = sourceImgUrl.value
  img.onload = function () {
    const nWidth = img.naturalWidth
    const nHeight = img.naturalHeight
    const nRatio = nWidth / nHeight
    let w = sim.width
    let h = sim.height
    let x = 0
    let y = 0
    if (nWidth < props.width || nHeight < props.height) {
      hasError.value = true
      errorMsg.value = lang.error.lowestPx + props.width + '*' + props.height
      return false
    }
    if (ratio > nRatio) {
      h = w / nRatio
      y = (sim.height - h) / 2
    }
    if (ratio < nRatio) {
      w = h * nRatio
      x = (sim.width - w) / 2
    }
    scale.range = 0
    scale.x = x
    scale.y = y
    scale.width = w
    scale.height = h
    scale.minWidth = w
    scale.minHeight = h
    scale.maxWidth = nWidth * sim.scale
    scale.maxHeight = nHeight * sim.scale
    scale.naturalWidth = nWidth
    scale.naturalHeight = nHeight
    sourceImg.value = img
    createImg()
    setStep(2)
  }
}

const imgStartMove = (e: any) => {
  e.preventDefault()
  if (isSupportTouch && !e.targetTouches) {
    return false
  }
  const et = e.targetTouches ? e.targetTouches[0] : e
  sourceImgMouseDown.mX = et.screenX
  sourceImgMouseDown.mY = et.screenY
  sourceImgMouseDown.x = scale.x
  sourceImgMouseDown.y = scale.y
  sourceImgMouseDown.on = true
}

const imgMove = (e: any) => {
  e.preventDefault()
  if (isSupportTouch && !e.targetTouches) {
    return false
  }
  const et = e.targetTouches ? e.targetTouches[0] : e
  const { on, mX, mY, x, y } = sourceImgMouseDown
  const sim = sourceImgMasking.value
  const nX = et.screenX
  const nY = et.screenY
  const dX = nX - mX
  const dY = nY - mY
  let rX = x + dX
  let rY = y + dY
  if (!on) return
  if (rX > 0) rX = 0
  if (rY > 0) rY = 0
  if (rX < sim.width - scale.width) rX = sim.width - scale.width
  if (rY < sim.height - scale.height) rY = sim.height - scale.height
  scale.x = rX
  scale.y = rY
}

const rotateImg = () => {
  const { naturalWidth, naturalHeight } = scale
  const w = naturalHeight
  const h = naturalWidth
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  canvas.width = w
  canvas.height = h
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, w, h)
  ctx.translate(w, 0)
  ctx.rotate((Math.PI * 90) / 180)
  ctx.drawImage(sourceImg.value!, 0, 0, naturalWidth, naturalHeight)
  const imgUrl = canvas.toDataURL((mimes as any).png)
  sourceImgUrl.value = imgUrl
  startCrop()
}

const startZoomAdd = () => {
  scale.zoomAddOn = true
  function zoom() {
    if (scale.zoomAddOn) {
      const range = scale.range >= 100 ? 100 : ++scale.range
      zoomImg(range)
      setTimeout(() => zoom(), 60)
    }
  }
  zoom()
}

const endZoomAdd = () => {
  scale.zoomAddOn = false
}

const startZoomSub = () => {
  scale.zoomSubOn = true
  function zoom() {
    if (scale.zoomSubOn) {
      const range = scale.range <= 0 ? 0 : --scale.range
      zoomImg(range)
      setTimeout(() => zoom(), 60)
    }
  }
  zoom()
}

const endZoomSub = () => {
  scale.zoomSubOn = false
}

const zoomChange = (e: any) => {
  zoomImg(e.target.value)
}

const zoomImg = (newRange: number) => {
  const { maxWidth, maxHeight, minWidth, minHeight, width: sw, height: sh, x, y } = scale
  const sim = sourceImgMasking.value
  const sWidth = sim.width
  const sHeight = sim.height
  const nWidth = minWidth + ((maxWidth - minWidth) * newRange) / 100
  const nHeight = minHeight + ((maxHeight - minHeight) * newRange) / 100
  let nX = sWidth / 2 - (nWidth / sw) * (sWidth / 2 - x)
  let nY = sHeight / 2 - (nHeight / sh) * (sHeight / 2 - y)
  if (nX > 0) nX = 0
  if (nY > 0) nY = 0
  if (nX < sWidth - nWidth) nX = sWidth - nWidth
  if (nY < sHeight - nHeight) nY = sHeight - nHeight
  scale.x = nX
  scale.y = nY
  scale.width = nWidth
  scale.height = nHeight
  scale.range = newRange
  setTimeout(() => {
    if (scale.range == newRange) {
      createImg()
    }
  }, 300)
}

const createImg = (e?: any) => {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  if (e) {
    sourceImgMouseDown.on = false
  }
  canvas.width = props.width
  canvas.height = props.height
  ctx.clearRect(0, 0, props.width, props.height)
  if (props.imgFormat == 'png') {
    ctx.fillStyle = 'rgba(0,0,0,0)'
  } else {
    ctx.fillStyle = props.imgBgc
  }
  ctx.fillRect(0, 0, props.width, props.height)
  const sim = sourceImgMasking.value
  ctx.drawImage(sourceImg.value!, scale.x / sim.scale, scale.y / sim.scale, scale.width / sim.scale, scale.height / sim.scale)
  createImgUrl.value = canvas.toDataURL(mime)
}

const prepareUpload = () => {
  emit('crop-success', createImgUrl.value, props.field, props.ki)
  if (typeof props.url == 'string' && props.url) {
    upload()
  } else {
    off()
  }
}

const upload = () => {
  const fmData = new FormData()
  fmData.append(props.field, data2blob(createImgUrl.value, mime), props.field + '.' + props.imgFormat)

  if (typeof props.params == 'object' && props.params) {
    Object.keys(props.params).forEach((k) => {
      fmData.append(k, (props.params as any)[k])
    })
  }

  const uploadProgress = function (event: ProgressEvent) {
    if (event.lengthComputable) {
      progress.value = (100 * Math.round(event.loaded)) / event.total
    }
  }

  reset()
  loading.value = 1
  setStep(3)
  new Promise<any>(function (resolve, reject) {
    const client = new XMLHttpRequest()
    client.open('POST', props.url, true)
    client.withCredentials = props.withCredentials
    client.onreadystatechange = function () {
      if (this.readyState !== 4) return
      if (this.status === 200 || this.status === 201) {
        resolve(JSON.parse(this.responseText))
      } else {
        reject(this.status)
      }
    }
    client.upload.addEventListener('progress', uploadProgress, false)
    if (typeof props.headers == 'object' && props.headers) {
      Object.keys(props.headers).forEach((k) => {
        client.setRequestHeader(k, (props.headers as any)[k])
      })
    }
    client.send(fmData)
  }).then(
    function (resData) {
      if (props.modelValue) {
        loading.value = 2
        emit('crop-upload-success', resData, props.field, props.ki)
      }
    },
    function (sts) {
      if (props.modelValue) {
        loading.value = 3
        hasError.value = true
        errorMsg.value = lang.fail
        emit('crop-upload-fail', sts, props.field, props.ki)
      }
    }
  )
}

onMounted(() => {
  document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (props.modelValue && (e.key == 'Escape' || e.keyCode == 27)) {
      off()
    }
  })
})
</script>

<style>
@charset "UTF-8";
@-webkit-keyframes vicp_progress {
  0% {
    background-position-y: 0;
  }
  100% {
    background-position-y: 40px;
  }
}
@keyframes vicp_progress {
  0% {
    background-position-y: 0;
  }
  100% {
    background-position-y: 40px;
  }
}

@-webkit-keyframes vicp {
  0% {
    opacity: 0;
    -webkit-transform: scale(0) translatey(-60px);
    transform: scale(0) translatey(-60px);
  }
  100% {
    opacity: 1;
    -webkit-transform: scale(1) translatey(0);
    transform: scale(1) translatey(0);
  }
}

@keyframes vicp {
  0% {
    opacity: 0;
    -webkit-transform: scale(0) translatey(-60px);
    transform: scale(0) translatey(-60px);
  }
  100% {
    opacity: 1;
    -webkit-transform: scale(1) translatey(0);
    transform: scale(1) translatey(0);
  }
}

.vue-image-crop-upload {
  position: fixed;
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  z-index: 10000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  -webkit-tap-highlight-color: transparent;
  -moz-tap-highlight-color: transparent;
}
.vue-image-crop-upload .vicp-wrap {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  position: fixed;
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  z-index: 10000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 600px;
  height: 330px;
  padding: 25px;
  background-color: #fff;
  border-radius: 2px;
  -webkit-animation: vicp 0.12s ease-in;
  animation: vicp 0.12s ease-in;
}
.vue-image-crop-upload .vicp-wrap .vicp-close {
  position: absolute;
  right: -30px;
  top: -30px;
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4 {
  position: relative;
  display: block;
  width: 30px;
  height: 30px;
  cursor: pointer;
  -webkit-transition: -webkit-transform 0.18s;
  transition: -webkit-transform 0.18s;
  transition: transform 0.18s;
  transition: transform 0.18s, -webkit-transform 0.18s;
  -webkit-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0);
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4::after,
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4::before {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  content: '';
  position: absolute;
  top: 12px;
  left: 4px;
  width: 20px;
  height: 3px;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  background-color: #fff;
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4::after {
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.vue-image-crop-upload .vicp-wrap .vicp-close .vicp-icon4:hover {
  -webkit-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  transform: rotate(90deg);
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area {
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 35px;
  height: 170px;
  background-color: rgba(0, 0, 0, 0.03);
  text-align: center;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-icon1 {
  display: block;
  margin: 0 auto 6px;
  width: 42px;
  height: 42px;
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-icon1 .vicp-icon1-arrow {
  display: block;
  margin: 0 auto;
  width: 0;
  height: 0;
  border-bottom: 14.7px solid rgba(0, 0, 0, 0.3);
  border-left: 14.7px solid transparent;
  border-right: 14.7px solid transparent;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-icon1 .vicp-icon1-body {
  display: block;
  width: 12.6px;
  height: 14.7px;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.3);
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-icon1 .vicp-icon1-bottom {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: block;
  height: 12.6px;
  border: 6px solid rgba(0, 0, 0, 0.3);
  border-top: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-hint {
  display: block;
  padding: 15px;
  font-size: 14px;
  color: #666;
  line-height: 30px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area .vicp-no-supported-hint {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  padding: 30px;
  width: 100%;
  height: 60px;
  line-height: 30px;
  background-color: #eee;
  text-align: center;
  color: #666;
  font-size: 14px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step1 .vicp-drop-area:hover {
  cursor: pointer;
  border-color: rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.05);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop {
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left {
  float: left;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-img-container {
  position: relative;
  display: block;
  width: 240px;
  height: 180px;
  background-color: #e5e5e0;
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-img-container .vicp-img {
  position: absolute;
  display: block;
  cursor: move;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-img-container .vicp-img-shade {
  -webkit-box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  position: absolute;
  background-color: rgba(241, 242, 243, 0.8);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-img-container .vicp-img-shade.vicp-img-shade-1 {
  top: 0;
  left: 0;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-img-container .vicp-img-shade.vicp-img-shade-2 {
  bottom: 0;
  right: 0;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-rotate {
  position: relative;
  width: 240px;
  height: 18px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-rotate i {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  line-height: 18px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.08);
  color: #fff;
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-rotate i:hover {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.14);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-rotate i:first-child {
  float: left;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-rotate i:last-child {
  float: right;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range {
  position: relative;
  margin: 30px 0 10px 0;
  width: 240px;
  height: 18px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon5,
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon6 {
  position: absolute;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.08);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon5:hover,
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon6:hover {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.14);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon5 {
  left: 0;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon5::before {
  position: absolute;
  content: '';
  display: block;
  left: 3px;
  top: 8px;
  width: 12px;
  height: 2px;
  background-color: #fff;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon6 {
  right: 0;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon6::before {
  position: absolute;
  content: '';
  display: block;
  left: 3px;
  top: 8px;
  width: 12px;
  height: 2px;
  background-color: #fff;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range .vicp-icon6::after {
  position: absolute;
  content: '';
  display: block;
  top: 3px;
  left: 8px;
  width: 2px;
  height: 12px;
  background-color: #fff;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range'] {
  display: block;
  padding-top: 5px;
  margin: 0 auto;
  width: 180px;
  height: 8px;
  /* vertical-align: top; */
  background: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  /* 滑块 ---------------------------------------------------------------*/
  /* 轨道 ---------------------------------------------------------------*/
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:focus {
  outline: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-webkit-slider-thumb {
  -webkit-box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  -webkit-appearance: none;
  appearance: none;
  margin-top: -3px;
  width: 12px;
  height: 12px;
  background-color: #61c091;
  border-radius: 100%;
  border: none;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-moz-range-thumb {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  -moz-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background-color: #61c091;
  border-radius: 100%;
  border: none;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-ms-thumb {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
  appearance: none;
  width: 12px;
  height: 12px;
  background-color: #61c091;
  border: none;
  border-radius: 100%;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:active::-moz-range-thumb {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  width: 14px;
  height: 14px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:active::-ms-thumb {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  width: 14px;
  height: 14px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:active::-webkit-slider-thumb {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.23);
  margin-top: -4px;
  width: 14px;
  height: 14px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-webkit-slider-runnable-track {
  -webkit-box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 2px;
  border: none;
  background-color: rgba(68, 170, 119, 0.3);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-moz-range-track {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 2px;
  border: none;
  background-color: rgba(68, 170, 119, 0.3);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-ms-track {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  color: transparent;
  height: 6px;
  border-radius: 2px;
  border: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-ms-fill-lower {
  background-color: rgba(68, 170, 119, 0.3);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']::-ms-fill-upper {
  background-color: rgba(68, 170, 119, 0.15);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:focus::-webkit-slider-runnable-track {
  background-color: rgba(68, 170, 119, 0.5);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:focus::-moz-range-track {
  background-color: rgba(68, 170, 119, 0.5);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:focus::-ms-fill-lower {
  background-color: rgba(68, 170, 119, 0.45);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left .vicp-range input[type='range']:focus::-ms-fill-upper {
  background-color: rgba(68, 170, 119, 0.25);
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right {
  float: right;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right .vicp-preview {
  height: 150px;
  overflow: hidden;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right .vicp-preview .vicp-preview-item {
  position: relative;
  padding: 5px;
  width: 100px;
  height: 100px;
  float: left;
  margin-right: 16px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right .vicp-preview .vicp-preview-item span {
  position: absolute;
  bottom: -30px;
  width: 100%;
  font-size: 14px;
  color: #bbb;
  display: block;
  text-align: center;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right .vicp-preview .vicp-preview-item img {
  position: absolute;
  display: block;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  padding: 3px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right .vicp-preview .vicp-preview-item.vicp-preview-item-circle {
  margin-right: 0;
}
.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right .vicp-preview .vicp-preview-item.vicp-preview-item-circle img {
  border-radius: 100%;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload {
  position: relative;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 35px;
  height: 170px;
  background-color: rgba(0, 0, 0, 0.03);
  text-align: center;
  border: 1px dashed #ddd;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-loading {
  display: block;
  padding: 15px;
  font-size: 16px;
  color: #999;
  line-height: 30px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-progress-wrap {
  margin-top: 12px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-progress-wrap .vicp-progress {
  position: relative;
  display: block;
  height: 5px;
  border-radius: 3px;
  background-color: #4a7;
  -webkit-box-shadow: 0 2px 6px 0 rgba(68, 170, 119, 0.3);
  box-shadow: 0 2px 6px 0 rgba(68, 170, 119, 0.3);
  -webkit-transition: width 0.15s linear;
  transition: width 0.15s linear;
  background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent);
  background-image: linear-gradient(-45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
  -webkit-animation: vicp_progress 0.5s linear infinite;
  animation: vicp_progress 0.5s linear infinite;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-progress-wrap .vicp-progress::after {
  content: '';
  position: absolute;
  display: block;
  top: -3px;
  right: -3px;
  width: 9px;
  height: 9px;
  border: 1px solid rgba(245, 246, 247, 0.7);
  -webkit-box-shadow: 0 1px 4px 0 rgba(68, 170, 119, 0.7);
  box-shadow: 0 1px 4px 0 rgba(68, 170, 119, 0.7);
  border-radius: 100%;
  background-color: #4a7;
}
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-error,
.vue-image-crop-upload .vicp-wrap .vicp-step3 .vicp-upload .vicp-success {
  height: 100px;
  line-height: 100px;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate a {
  position: relative;
  float: left;
  display: block;
  margin-left: 10px;
  width: 100px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #4a7;
  border-radius: 2px;
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate a:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.vue-image-crop-upload .vicp-wrap .vicp-error,
.vue-image-crop-upload .vicp-wrap .vicp-success {
  display: block;
  font-size: 14px;
  line-height: 24px;
  height: 24px;
  color: #d10;
  text-align: center;
  /* vertical-align: top; */
}
.vue-image-crop-upload .vicp-wrap .vicp-success {
  color: #4a7;
}
.vue-image-crop-upload .vicp-wrap .vicp-icon3 {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  top: 4px;
}
.vue-image-crop-upload .vicp-wrap .vicp-icon3::after {
  position: absolute;
  top: 3px;
  left: 6px;
  width: 6px;
  height: 10px;
  border-width: 0 2px 2px 0;
  border-color: #4a7;
  border-style: solid;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  content: '';
}
.vue-image-crop-upload .vicp-wrap .vicp-icon2 {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  top: 4px;
}
.vue-image-crop-upload .vicp-wrap .vicp-icon2::after,
.vue-image-crop-upload .vicp-wrap .vicp-icon2::before {
  content: '';
  position: absolute;
  top: 9px;
  left: 4px;
  width: 13px;
  height: 2px;
  background-color: #d10;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
.vue-image-crop-upload .vicp-wrap .vicp-icon2::after {
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}

.e-ripple {
  position: absolute;
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.15);
  background-clip: padding-box;
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transform: scale(0);
  -ms-transform: scale(0);
  transform: scale(0);
  opacity: 1;
}
.e-ripple.z-active {
  opacity: 0;
  -webkit-transform: scale(2);
  -ms-transform: scale(2);
  transform: scale(2);
  -webkit-transition: opacity 1.2s ease-out, -webkit-transform 0.6s ease-out;
  transition: opacity 1.2s ease-out, -webkit-transform 0.6s ease-out;
  transition: opacity 1.2s ease-out, transform 0.6s ease-out;
  transition: opacity 1.2s ease-out, transform 0.6s ease-out, -webkit-transform 0.6s ease-out;
}
</style>
