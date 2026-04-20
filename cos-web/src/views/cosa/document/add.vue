<template>
  <el-card>
    <basic-form :model="addData" ref="addData" label-width="110px">
      <el-row>
        <el-col :span="24">
          <basic-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="排序：" prop="priority" validate="required">
            <el-input-number v-model="addData.priority" :controls="false"></el-input-number>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="内容：" prop="content">
            <!-- <editor :value="addData.content" @change="setValue"></editor> -->
            <mavon-editor ref="mavon" :toolbars="toolbars" @imgAdd="changeImg" @imgDel="removeImg" v-model="addData.content" />
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="描述：" prop="remark">
            <el-input type="textarea" :rows="3" v-model="addData.remark" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div class="pull-right m-b">
      <el-button type="ghost" @click="cancle">取消</el-button>
      <el-button type="primary" @click="addSubmit">确定</el-button>
    </div>
  </el-card>
</template>
<script>
import { getDocumentDetail, modifyDocument, createDocument, uploadImage } from 'services/system/document'
export default {
  data() {
    return {
      addData: {},
      id: this.$route.params.id,
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        // underline: true, // 下划线
        // strikethrough: true, // 中划线
        // mark: true, // 标记
        // superscript: true, // 上角标
        // subscript: true, // 下角标
        // quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        // link: true, // 链接
        // imagelink: true, // 图片链接
        // code: true, // code
        // table: true, // 表格
        fullscreen: true, // 全屏编辑
        // readmodel: true, // 沉浸式阅读
        // htmlcode: true, // 展示html源码
        // help: true, // 帮助
        /* 1.3.5 */
        // undo: true, // 上一步
        // redo: true, // 下一步
        // trash: true, // 清空
        // save: true, // 保存（触发events中的save事件）
        /* 1.4.2 */
        // navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      }
    }
  },
  mounted() {
    const ary = document.getElementsByTagName('textarea')
    setTimeout(() => {
      ary[0].maxLength = 100000
    })
  },
  created() {
    if (this.id) {
      getDocumentDetail(this.id).then((data) => {
        if (data.success) {
          this.addData = data.data
        }
      })
    }
  },
  methods: {
    changeImg(filename, File) {
      // this.$refs.mavon.$img2Url(filename, File.miniurl)
      const formData = new FormData()
      formData.append('file', File)
      uploadImage(formData).then((data) => {
        if (data.success) {
          this.$refs.mavon.$img2Url(filename, data.data)
        }
      })
    },
    removeImg(filename) {},
    cancle() {
      this.$router.go(-1)
    },
    setValue(data) {
      this.$set(this.addData, 'content', data)
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          if (!this.addData.id) {
            createDocument({
              ...this.addData,
              parentId: this.id
            }).then((data) => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.$router.go(-1)
              }
            })
          } else {
            modifyDocument({
              ...this.addData
            }).then((data) => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.$router.go(-1)
              }
            })
          }
        }
      })
    }
  }
}
</script>
