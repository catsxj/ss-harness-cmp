<template>
  <a-modal title="个人信息" ref="dialog" :close-on-click-modal="false" v-model:visible="visible" width="800px" @ok="editSubmit" okText="更新信息" cancelText="" :confirmLoading="loading">
    <a-form v-bind="formSetting">
      <a-row :gutter="5">
        <a-col :span="12">
          <a-col :span="24">
            <div class="info-header-title">基本信息</div>
          </a-col>
          <a-col :span="24">
            <a-form-item label="登录账号：">
              <a-input v-model:value="userData.account" disabled></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="用户姓名：" v-bind="validateInfos.name">
              <a-input v-model:value="userData.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <div class="info-header-title">联系信息</div>
          </a-col>
          <a-col :span="24">
            <a-form-item label="用户邮箱：" v-bind="validateInfos.email">
              <a-input v-model:value="userData.email"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="联系方式：" v-bind="validateInfos.mobile">
              <a-input v-model:value="userData.mobile"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="公司名称：">
              <a-input v-model:value="userData.company"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="组织机构：">
              <a-input v-model:value="userData.departName" disabled></a-input>
            </a-form-item>
          </a-col>
        </a-col>
        <a-col :span="12">
          <div class="info-img">
            <img :src="userData.portrait" alt="" />
          </div>
          <div class="info-btn">
            <a-button @click="imageCropperShow = true">
              <template #icon><CloudUploadOutlined /></template>
              更换头像</a-button
            >
          </div>
        </a-col>
      </a-row>
    </a-form>
    <image-cropper field="files" @crop-success="imageCropSuccess" v-if="imageCropperShow" v-model="imageCropperShow" :width="size" :height="size" img-format="png"></image-cropper>
  </a-modal>
</template>
<script>
import { message, Form } from 'ant-design-vue'
import { cloneDeep } from 'lodash-es'
import ImageCropper from 'components/image-cropper/index.vue'
import { modifyUser } from '@/services/manager'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import { reactive, toRefs, ref } from 'vue'
import { useStore } from 'vuex'
import { required, email, mobile } from '@/validate'
import { formSetting } from '@/config'

const useForm = Form.useForm
export default {
  props: {
    data: {
      type: Object
    }
  },
  components: {
    ImageCropper,
    CloudUploadOutlined
  },
  setup(props) {
    const state = reactive({
      imageCropperShow: false,
      size: 65,
      visible: false,
      userData: {}
    })
    function open() {
      const userData = cloneDeep(props.data)
      Object.keys(userData).forEach((key) => {
        state.userData[key] = userData[key]
      })
      state.visible = true
    }
    function imageCropSuccess(imageDataUrl) {
      state.userData.portrait = imageDataUrl
    }
    const formRef = ref(null)
    const store = useStore()
    const loading = ref(false)
    const rulesRef = reactive({
      name: [required],
      email: [required, email],
      mobile: [required, mobile]
    })
    const { validate, validateInfos } = useForm(state.userData, rulesRef)
    async function editSubmit() {
      try {
        loading.value = true
        await validate()
        const data = await modifyUser(state.userData)
        loading.value = false
        if (data.success) {
          message.success(data.message)
          state.visible = false
          store.dispatch('GetUserInfo')
        }
      } catch (error) {
        loading.value = false
      }
    }
    return {
      loading,
      formSetting,
      ...toRefs(state),
      formRef,
      validateInfos,
      open,
      editSubmit,
      imageCropSuccess
    }
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.info-header-title {
  padding-left: 10px;
  border-left: 3px solid #2d8cf0;
  margin-bottom: 20px;
}

.info-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 90px 0px 20px 100px;
  border: 1px solid #d9d9d9;
  margin-top: 40px;
}

.info-img img {
  width: 100%;
  height: 100%;
}

.info-btn {
  margin: 0px 0px 0px 100px;
}
</style>
