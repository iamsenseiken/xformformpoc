<template>
  <button
    class="atom-button"
    :disabled="!enabled"
    @click="enabled ? onClick : undefined"
    v-bind="$attrs"
  >
    {{ label }}
  </button>
</template>

<script>
export default {
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
    }
  },
  mounted() {
    // Vue equivalent of React componentDidMount
  },
  methods: {
    // Any additional methods can be defined here
  }
};
</script>

<style scoped>
.atom-button {
  /* Add your CSS styles here */
}
</style>