<script setup>
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  coach_name: String,
  name: String,
  id: String,
});

const emit = defineEmits([
  "closeConfirmWhetherToRegisterModal",
  "confirmRegistration",
]);

function closeConfirmWhetherToRegisterModal() {
  emit("closeConfirmWhetherToRegisterModal");
}

function confirmRegistration() {
  emit("closeConfirmWhetherToRegisterModal");
  emit("confirmRegistration", props.id);
}

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
    @click="closeConfirmWhetherToRegisterModal"
  >
    <div
      class="bg-primary-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in"
      @click.stop
    >
      <button
        @click="closeConfirmWhetherToRegisterModal"
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
        <h5 class="text-2xl text-primary-0">是否確認報名</h5>

        <p class="text-2xl text-center text-primary-0 leading-relaxed">
          <span class="font-bold text-secondary-800">{{ coach_name }}</span>
          老師
        </p>
        <p class="text-2xl font-bold text-primary-0">
          <span class="text-secondary-800">{{ name }}</span
          >？
        </p>

        <div class="flex gap-12 justify-center">
          <button
            class="bg-secondary-800 text-primary-900 px-8 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
            @click="confirmRegistration"
          >
            報名
          </button>
          <button
            class="bg-primary-800 text-primary-0 px-8 py-2 rounded-lg font-semibold hover:opacity-90 transition-all border border-primary-300"
            @click="closeConfirmWhetherToRegisterModal"
          >
            取消
          </button>
        </div>
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
