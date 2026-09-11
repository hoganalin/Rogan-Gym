import { ref, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";

export function useCurrentTime(updateInterval = 60000) {
  const currentTime = ref(dayjs());
  let timer = null;

  onMounted(() => {
    // 每秒（或指定間隔）更新當前時間
    timer = setInterval(() => {
      currentTime.value = dayjs();
    }, updateInterval);
  });

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return {
    currentTime,
  };
}
