import Vue from 'vue'
let componentInstance,
  MyComponent = null
export default {
  data() {},
  beforeDestroy() {
    if (componentInstance?.$destroy) {
      componentInstance.$destroy()
    }
    MyComponent = null
    componentInstance = null
  },
  methods: {
    CreateComponent(countData) {
      return Vue.extend({
        data() {
          return {
            countData: countData
          }
        },
        render(h) {
          return h(
            'el-row',
            {
              domProps: {
                id: 'cus-block'
              },
              props: {
                gutter: 10
              },
              class: ['m-b']
            },
            this.countData.map((item) =>
              h(
                'el-col',
                {
                  props: {
                    span: 6
                  }
                },
                [h('div', { class: ['text-center', 'item'] }, [h('div', item.name), h('div', item.value + item.unit)])]
              )
            )
          )
        }
      })
    },
    GeneratorBlockComponent(countData) {
      if (!componentInstance) {
        MyComponent = this.CreateComponent(countData)
        // 现在，我们创建一个实例
        componentInstance = new MyComponent()
        // 挂载实例到文档之外的元素上
        componentInstance.$mount()
      } else {
        componentInstance.countData = countData
      }
      this.insertComponent()
    },
    insertComponent() {
      // 找到需要插入新组件的DOM元素
      const referenceElement = document.getElementsByClassName('table-tools')[0]
      if (!referenceElement) return
      // 把Vue组件的DOM插入到找到的DOM元素之后
      referenceElement.parentNode.insertBefore(componentInstance.$el, referenceElement.nextSibling)
    }
  }
}
