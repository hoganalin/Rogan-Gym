<template>
  <div class="mb-8">
    <h3 class="text-4xl font-bold">
      <span class="text-primary-0">{{ name }}</span>
      <span class="text-secondary-800">的課程分潤報表</span>
    </h3>
    <p class="mt-2 text-lg text-primary-300 leading-relaxed">
      追蹤您的課程堂數、學員數據與月度營收表現
    </p>
  </div>

  <div class="mb-6 flex items-center justify-center gap-4">
    <button
      @click="previousMonth"
      :disabled="isPreviousMonthDisabled"
      :class="[
        'p-2 rounded-lg transition-colors',
        isPreviousMonthDisabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:bg-primary-700',
      ]"
      aria-label="上個月"
    >
      <svg
        class="w-8 h-8 text-primary-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <div
      class="text-2xl font-semibold text-primary-0 min-w-[280px] text-center"
    >
      {{ currentYear }} 年 {{ currentMonthNumber }}月營收數據
    </div>

    <button
      @click="nextMonth"
      :disabled="isNextMonthDisabled"
      :class="[
        'p-2 rounded-lg transition-colors',
        isNextMonthDisabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:bg-primary-700',
      ]"
      aria-label="下個月"
    >
      <svg
        class="w-8 h-8 text-primary-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>

  <div v-if="revenueData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div
      class="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-600 text-center"
    >
      <h4 class="text-lg font-medium text-primary-400 mb-2">總收益</h4>
      <p class="text-4xl font-bold text-secondary-800">
        $ {{ $formatCurrency(revenueData.revenue) }}
      </p>
      <p class="text-lg text-primary-300 mt-1">本月分潤</p>
    </div>

    <div
      class="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-600 text-center"
    >
      <h4 class="text-lg font-medium text-primary-400 mb-2">總參與人數</h4>
      <p class="text-4xl font-bold text-info-200">
        {{ revenueData.participants }}
      </p>
      <p class="text-lg text-primary-300 mt-1">位學員</p>
    </div>

    <div
      class="bg-primary-800 p-6 rounded-lg shadow-md border border-primary-600 text-center"
    >
      <h4 class="text-lg font-medium text-primary-400 mb-2">本月報名數</h4>
      <p class="text-4xl font-bold text-success-600">
        {{ revenueData.course_count }}
      </p>
      <p class="text-lg text-primary-300 mt-1">筆報名</p>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <p class="text-primary-400">暫無資料</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../../stores/user.js";
import { getMonthlyRevenue } from "../../api/index.js";
import dayjs from "dayjs";

const { name } = storeToRefs(useUserStore());

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const currentDate = ref(dayjs());
const revenueData = ref(null);

const currentMonthName = computed(() => {
  const monthIndex = currentDate.value.month();
  return months[monthIndex];
});

const currentYear = computed(() => {
  return currentDate.value.year();
});

const currentMonthNumber = computed(() => {
  return currentDate.value.month() + 1;
});

// 判斷是否為 1 月，如果是則禁用上個月按鈕
const isPreviousMonthDisabled = computed(() => {
  return currentMonthNumber.value === 1;
});

// 判斷是否為 12 月，如果是則禁用下個月按鈕
const isNextMonthDisabled = computed(() => {
  return currentMonthNumber.value === 12;
});

// 上一個月
const previousMonth = () => {
  if (isPreviousMonthDisabled.value) return;
  currentDate.value = currentDate.value.subtract(1, "month");
  getCoachRevenue();
};

// 下一個月
const nextMonth = () => {
  if (isNextMonthDisabled.value) return;
  currentDate.value = currentDate.value.add(1, "month");
  getCoachRevenue();
};

// 取得月度收益資料
const getCoachRevenue = async () => {
  try {
    const { data } = await getMonthlyRevenue(currentMonthName.value);
    revenueData.value = data.total;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCoachProfile] error : ${msg}`);
  }
};

onMounted(() => {
  getCoachRevenue();
});
</script>
