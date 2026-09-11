<script setup>
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits(["closeFitnessPlanSuccessModal"]);

function closeFitnessPlanSuccessModal() {
  emit("closeFitnessPlanSuccessModal");
}

// 鎖定 body 和 html 的滾動
onMounted(() => {
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
});

onUnmounted(() => {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-modal-overlay"
    @click="closeFitnessPlanSuccessModal"
  >
    <div
      class="bg-primary-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in"
      @click.stop
    >
      <button
        @click="closeFitnessPlanSuccessModal"
        class="absolute top-4 right-4 text-primary-400 hover:text-primary-300 transition-colors"
        aria-label="關閉"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="text-center space-y-6 mt-2">
        <h5 class="text-3xl font-bold text-primary-0">報名成功</h5>

        <p
          class="text-xl font-semibold text-center text-primary-0 leading-relaxed"
        >
          開幕期間前三個月<br />皆能<span class="text-secondary-800">無限次數</span><br /><span class="text-secondary-800">免費報名</span>任一方案!
        </p>

        <button
          class="inline-block w-full bg-secondary-800 text-primary-900 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
          @click="closeFitnessPlanSuccessModal"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
</style>
