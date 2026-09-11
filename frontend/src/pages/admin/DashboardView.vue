<template>
  <div>
    <h3 class="text-4xl font-bold text-primary-0">
      <span class="text-primary-0">當月方案</span>
      <span class="text-secondary-800">購買比例</span>
    </h3>
    <p class="mt-2 text-lg text-primary-300 leading-relaxed">
      即時掌握方案銷售、預約狀況與營收表現
    </p>
  </div>

  <div class="w-full h-[400px] md:h-[650px] mb-5">
    <div ref="purchaseRatioPieDom" class="w-full h-full"></div>
  </div>
  <div class="mb-8">
    <h3 class="text-4xl font-bold text-primary-0">
      <span class="text-primary-0">當月整理</span>
      <span class="text-secondary-800">使用情況</span>
    </h3>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 mb-8">
    <div
      class="bg-primary-800 rounded-4xl border-4 border-primary-600 p-5 xl:col-span-3"
    >
      <div class="flex items-center justify-between h-full">
        <div>
          <p class="text-5xl font-bold mb-2 text-secondary-800">3.2K</p>
          <p class="text-lg font-semibold text-primary-0 mt-1">預約課程數</p>
        </div>
        <div class="flex items-center text-red-400">
          <span class="text-2xl font-bold">150</span>
          <span class="text-2xl font-bold">↑</span>
        </div>
      </div>
    </div>

    <div
      class="bg-primary-800 rounded-4xl border-4 border-primary-600 p-5 xl:col-span-3"
    >
      <div class="flex items-center justify-between h-full">
        <div>
          <p class="text-5xl font-bold mb-2 text-secondary-800">1.4K</p>
          <p class="text-lg font-semibold text-primary-0 mt-1">
            本月活躍用戶數
          </p>
        </div>
        <div class="flex items-center text-red-400">
          <span class="text-2xl font-bold">150</span>
          <span class="text-2xl font-bold">↑</span>
        </div>
      </div>
    </div>

    <div
      class="bg-primary-800 rounded-4xl border-4 border-primary-600 p-5 md:col-span-2 xl:col-span-6 relative"
    >
      <div class="flex flex-col">
        <p class="text-lg font-semibold text-primary-0 mb-2">當月總收入</p>
        <p class="text-5xl font-bold mb-4 text-secondary-800">$450,000</p>
        <div class="w-full h-[100px]">
          <div ref="monthlyIncomeBasicAreaDom" class="w-full h-full"></div>
        </div>
      </div>
      <div class="absolute bottom-0 right-6 flex items-center text-red-400">
        <span class="text-2xl font-bold">10%</span>
        <span class="text-2xl font-bold">↑</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import purchaseRatioPie from "../../chart/purchaseRatioPie.js";
import monthlyIncomeBasicArea from "../../chart/monthlyIncomeBasicArea.js";

const purchaseRatioPieDom = ref();
const monthlyIncomeBasicAreaDom = ref();
const purchaseRatioData = ref([
  {
    value: 3,
    name: "7天方案",
  },
  {
    value: 10,
    name: "14天方案",
  },
  {
    value: 2,
    name: "21天方案",
  },
]);
const monthlyIncomeBasicAreaData = ref([10, 20, 80, 100, 60, 30, 50]);

function getPurchaseRatioPie(data) {
  const { setOption, resize } = purchaseRatioPie(purchaseRatioPieDom.value);
  setOption(data);
  window.addEventListener("resize", () => {
    resize();
  });
}

function getMonthlyIncomeBasicArea(data) {
  const { setOption, resize } = monthlyIncomeBasicArea(
    monthlyIncomeBasicAreaDom.value
  );
  setOption(data);
  window.addEventListener("resize", () => {
    resize();
  });
}

onMounted(() => {
  getPurchaseRatioPie(purchaseRatioData.value);
  getMonthlyIncomeBasicArea(monthlyIncomeBasicAreaData.value);
});
</script>
