<template>
  <div class="statusLightWraper" :status="status">
    <span class="statusLight1"></span>
    <span class="statusLight2"></span>
    <span class="statusLight3"></span>
    <span class="statusLight4"></span>
    <span class="statusLight5"></span>
    <span class="statusLight6"></span>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
@for $i from 1 through 6 {
  .statusLight#{$i} {
    animation-delay: 250ms * ($i - 1);
  }
}

.statusLightWraper {
  display: flex;
  justify-content: center;
  margin: 10px 0;

  span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin: 0 5px;
    background-color: #ffd04b;
    opacity: 0.1;
    animation-duration: 2500ms;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: reverse;
  }

  &[status='true'] {
    span {
      animation-name: statusLight;
    }
  }
}

@keyframes statusLight {
  15% {
    opacity: 1;
  }
  30% {
    opacity: 0;
  }
}
</style>
