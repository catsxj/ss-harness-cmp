<template>
  <article class="cd">
    <header class="cd__head">
      <button class="cd__back" @click="emit('goBack')" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 v-if="title" class="cd__title">{{ title }}</h1>
      <span class="cd__rule" aria-hidden="true"></span>
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

.cd {
  background: $bg-surface;
  border: 1px solid $border-hairline;
  border-radius: 6px;
  box-shadow: $shadow-subtle;
}

.cd__head {
  display: flex;
  align-items: baseline;
  gap: 20px;
  padding: 20px 28px 16px;
  border-bottom: 1px solid $border-hairline;
  position: relative;
}

.cd__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 6px;
  margin-left: -6px;
  border: 1px solid $border-hairline;
  background: $bg-surface;
  color: $text-secondary;
  font-size: 12px;
  font-family: $font-body;
  border-radius: 4px;
  cursor: pointer;
  transition: all $dur-fast $ease-out;

  &:hover {
    color: $text-primary;
    border-color: $border-solid;
    background: $bg-subtle;
  }
  &:active {
    transform: translateY(1px);
  }
}

.cd__title {
  font-family: $font-display;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: $tracking-tight;
  color: $text-primary;
  margin: 0;
  line-height: 1.2;
}

.cd__rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, $border-hairline, transparent);
  margin-left: 12px;
  align-self: center;
}

.cd__items {
  padding: 16px 28px;
  background: $bg-subtle;
  border-bottom: 1px solid $border-hairline;
}

.cd__items-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 28px;
}

.cd__custom {
  padding: 16px 28px;
}

.cd__body {
  padding: 20px 28px 24px;
}
</style>
