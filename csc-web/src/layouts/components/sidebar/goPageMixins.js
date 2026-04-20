import { getConfig, getToken } from 'services/system'

export default {
  data() {
    return {}
  },
  created() { },
  methods: {
    // 页面跳转逻辑
    async goPage(item) {
      console.log({ ...item })
      const { path, code, vendorType } = item
      if (path) {
        this.$emit('close')
        // 外链接
        if (/^(http:|https:|mailto:|tel:)\/\//.test(path)) {
          let currPath = path
          if (code === 'vmware.k8s.cluster') {
            const data = await Promise.all([getConfig({ code: 'K8sAddress' }), getToken(), getConfig({ code: 'K8sRedirect' })])
            const [f, s, t] = data
            if (f.success && s.success) {
              currPath = `${f.data}/upmsapi/sso/redirect?token=${s.data}&redirect=${t.data}`
              location.href = currPath
            }
          }
          return
        }

        this.$router.push({
          path,
          query: { vendorType }
        })
      } else this.$message.error('请将菜单与服务目录进行绑定')
    }
  }
}
