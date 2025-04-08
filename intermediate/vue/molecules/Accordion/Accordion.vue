```html
<template>
  <div class="molecule-accordion">
    <div 
      class="accordion-title" 
      :class="{ open: isOpen }" 
      @click="toggleAccordion"
    >
      {{ title }}
    </div>
    <div v-if="isOpen" class="accordion-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: this.open
    };
  },
  methods: {
    toggleAccordion() {
      this.isOpen = !this.isOpen;
    }
  }
};
</script>

<style scoped>
.molecule-accordion {
  /* Add your styles here */
}

.accordion-title {
  /* Add your styles here */
}

.open {
  /* Add your styles here */
}

.accordion-content {
  /* Add your styles here */
}
</style>
```