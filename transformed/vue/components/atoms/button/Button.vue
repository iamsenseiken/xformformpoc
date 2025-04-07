```html
<template>
  <button
    class="atom-button"
    :disabled="!enabled"
    @click="handleClick"
    v-bind="props"
  >
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    label: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    onClick: {
      type: Function,
      required: true
    },
    props: {
      type: Object
    }
  },
  methods: {
    handleClick() {
      if (this.enabled) {
        this.onClick();
      }
    }
  }
};
</script>

<style scoped>
.atom-button {
  /* Add your Button.css styles here */
}
</style>
```