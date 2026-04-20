/* eslint-disable vue/no-parsing-error */
<template>
  <span>
    <Link :to="path">
      <el-menu-item :index="path" ref="menuItemRef">
        <svg-icon :icon-name="meta.icon || defaultIcon"></svg-icon>
        <span slot="title">{{ meta.title }}</span>
      </el-menu-item>
    </Link>
  </span>
</template>

<script>
import { inject, ref, computed } from '@vue/composition-api'
import Link from './Link.vue'
export default {
  components: {
    Link
  },
  props: {
    path: {
      type: String
    },
    meta: {
      type: Object
    },
    defaultIcon: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    const menuItemRef = ref(null)
    // const bgColor = inject('backgroundActiveColor');
    // const isActivePath = () => {
    //   return context.root.$route.path.includes(props.path)
    // }
    // const style = computed(() => {
    //   if (isActivePath()) {
    //     return {
    //       background: bgColor.value
    //     }
    //   }
    // })
    // const onMouseEnter = () => {
    //   menuItemRef.value.$el.style.backgroundColor = bgColor.value;
    // };
    // const onMouseLeave = () => {
    //   // 延时的目的是在el-menu-item 后执行
    //   if (isActivePath()) {
    //     menuItemRef.value.$el.style.backgroundColor = bgColor.value;
    //   }
    // }
    return {
      menuItemRef
      // style,
      // onMouseEnter,
      // onMouseLeave
    }
  }
}
</script>
