<template>
  <el-dialog title="个人信息" :close-on-click-modal="false" v-model="visible">
    <basic-form :model="userData" ref="formRef">
      <el-row :gutter="5">
        <el-col :span="10">
          <el-col :span="24">
            <div class="info-header-title">基本信息</div>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="登录账号：">
              <el-input v-model="userData.account" disabled></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="用户姓名：" prop="name" validate="required">
              <el-input v-model="userData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <div class="info-header-title">联系信息</div>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="用户邮箱：" prop="email" validate="required,email">
              <el-input v-model="userData.email"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="联系方式：" prop="mobile" validate="required,mobile">
              <el-input v-model="userData.mobile"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="公司名称：">
              <el-input v-model="userData.company"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="组织机构：">
              <el-input v-model="userData.departName" disabled></el-input>
            </basic-form-item>
          </el-col>
        </el-col>
        <el-col :span="14">
          <div class="info-img">
            <img :src="userData.portrait" alt="" />
          </div>
          <div class="info-btn">
            <el-button @click="imageCropperShow = true">
              <el-icon><Upload /></el-icon>
              更换头像
            </el-button>
          </div>
        </el-col>
      </el-row>
    </basic-form>
    <image-cropper field="files" @crop-success="imageCropSuccess" v-if="imageCropperShow" v-model="imageCropperShow" :width="size" :height="size" img-format="png"></image-cropper>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="editSubmit">更新信息</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'
import ImageCropper from 'components/image-cropper/index.vue'
import { modifyUser } from 'services/system/manager'
import { useAppStore } from '@/stores'

interface UserInfo {
  id?: string | number
  account?: string
  name?: string
  email?: string
  mobile?: string
  company?: string
  departName?: string
  portrait?: string
  [key: string]: unknown
}

const props = defineProps<{
  data?: UserInfo
}>()

const imageCropperShow = ref(false)
const size = ref(65)
const visible = ref(false)
const userData = ref<UserInfo>({})

// TODO: type - basic-form 实例无公开类型
const formRef = ref<any>(null)

const appStore = useAppStore()

function open() {
  userData.value = cloneDeep(props.data || {})
  visible.value = true
}

function imageCropSuccess(imageDataUrl: string) {
  userData.value.portrait = imageDataUrl
}

function editSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      modifyUser(userData.value).then((data: any) => {
        if (data.success) {
          ElMessage({
            message: data.message,
            type: 'success'
          })
          visible.value = false
          appStore.getUserInfo()
        }
      })
    }
  })
}

defineExpose({
  open
})
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
