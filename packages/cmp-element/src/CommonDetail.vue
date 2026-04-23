<template>
  <article class="cd">
    <header class="cd__head">
      <button class="cd__back" @click="emit('goBack')" type="button">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <span class="cd__line" aria-hidden="true"></span>
      <h1 v-if="title" class="cd__title">{{ title }}</h1>
    </header>

    <section v-if="$slots.item_container" class="cd__items">
      <div class="cd__items-inner">
        <slot name="item_container"></slot>
      </div>
    </section>

    <section v-if="$slots.custom_content" class="cd__custom">
      <slot name="custom_content"></slot>
    </section>

    <section class="cd__body">
      <slot></slot>
    </section>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  label?: string
  setting?: Record<string, any>
}>()
const emit = defineEmits<{ goBack: [] }>()
</script>

<style lang="scss" scoped>
@import '@ss-cmp/design-tokens/src/tokens.scss';

// cmp-basic 基准：1px #e6e6e6 边框 / 白底 / 无阴影无圆角
.cd {
  background: #fff;
  border: 1px solid $cmp-border-muted;
  border-radius: 0;
  box-shadow: none;
  color: $cmp-text-body;
}

// header 高度 44px、padding 0 20px、底部边框 1px #e6e6e6
.cd__head {
  display: flex;
  align-items: center;
  height: $cmp-detail-header-height;
  line-height: $cmp-detail-header-height;
  padding: 0 20px;
  border-bottom: 1px solid $cmp-border-muted;
}

// 返回：蓝色链接 #46abf1
.cd__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: $cmp-link-back;
  font-size: 14px;
  font-family: $font-body;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: $cmp-accent;
  }
}

// 分隔线：20px 高、1px 宽、#b5b5b5
.cd__line {
  display: inline-block;
  width: 1px;
  height: 20px;
  background: #b5b5b5;
  margin: 0 16px;
  flex-shrink: 0;
}

// 标题：14px body 字体（cmp-basic 标题内容区默认 14px）
.cd__title {
  font-family: $font-body;
  font-size: 14px;
  font-weight: 600;
  color: $cmp-text-body;
  margin: 0;
  line-height: 1;
}

// 条目区：去除 Q1 风格底色，保持 grid 布局但用普通白底
.cd__items {
  padding: 16px 20px;
  border-bottom: 1px solid $cmp-border-muted;
}

.cd__items-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 24px;
}

.cd__custom {
  padding: 16px 20px;
}

.cd__body {
  padding: 20px;
}
</style>
