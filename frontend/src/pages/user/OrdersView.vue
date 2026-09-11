<template>
  <div class="bg-primary-900 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h3 class="text-4xl font-bold">
          <span class="text-primary-0">我的</span>
          <span class="text-secondary-800">訂單</span>
        </h3>
        <p class="text-primary-300 text-lg mt-2 leading-relaxed">
          查看您的所有購買記錄
        </p>
      </div>

      <div
        v-if="orders.length === 0"
        class="bg-primary-800 border border-primary-600 rounded-lg p-12 text-center"
      >
        <svg
          class="mx-auto h-12 w-12 text-primary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-2 text-2xl font-medium text-primary-0">尚無訂單記錄</h3>
        <p class="mt-1 text-lg text-primary-300">您還沒有購買任何課程方案</p>
      </div>

      <div v-else class="bg-primary-800 rounded-lg shadow-lg overflow-hidden border border-primary-600">
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-primary-600">
            <thead class="bg-primary-700">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider"
                >
                  消費日期
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider"
                >
                  方案名稱
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider"
                >
                  購買堂數
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider"
                >
                  消費金額
                </th>
              </tr>
            </thead>
            <tbody class="bg-primary-800 divide-y divide-primary-600">
              <tr
                v-for="(order, index) in orders"
                :key="index"
                class="hover:bg-primary-700 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-lg text-primary-0">
                    {{ formatLocalDateTime(order.purchase_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-lg font-medium text-primary-0">
                    {{ order.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium bg-secondary-800 text-primary-0"
                  >
                    {{ order.purchased_credits }} 堂
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-lg font-semibold text-primary-0">
                    $ {{ $formatCurrency(order.price_paid) }}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-primary-700">
              <tr>
                <td
                  colspan="2"
                  class="px-6 py-4 text-right text-lg font-medium text-primary-0"
                >
                  總計
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-secondary-700 text-primary-0"
                  >
                    {{ totalCredits }} 堂
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-lg font-bold text-primary-0">
                    $ {{ $formatCurrency(totalAmount) }}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="md:hidden">
          <div
            v-for="(order, index) in orders"
            :key="index"
            class="border-b border-primary-600 p-4 last:border-b-0"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-primary-0">
                {{ order.name }}
              </h3>
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-base font-medium bg-secondary-800 text-primary-0"
              >
                {{ order.purchased_credits }} 堂
              </span>
            </div>
            <div class="space-y-2 text-lg">
              <div class="flex justify-between">
                <span class="text-primary-300">消費日期</span>
                <span class="text-primary-0">{{
                  formatLocalDateTime(order.purchase_at)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-primary-300">消費金額</span>
                <span class="font-semibold text-primary-0"
                  >$ {{ $formatCurrency(order.price_paid) }}</span
                >
              </div>
            </div>
          </div>

          <div class="bg-primary-700 p-4 border-t-2 border-secondary-800">
            <div class="flex justify-between items-center mb-2">
              <span class="text-lg font-medium text-primary-0">總購買堂數</span>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-secondary-700 text-primary-0"
              >
                {{ totalCredits }} 堂
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-primary-0">總消費金額</span>
              <span class="text-lg font-bold text-primary-0"
                >$ {{ $formatCurrency(totalAmount) }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getUserCreditPackage } from "../../api/index.js";
import { formatLocalDateTime } from "../../utils/formatDateTime.js";

const orders = ref([]);

const totalCredits = computed(() => {
  return orders.value.reduce((sum, order) => sum + order.purchased_credits, 0);
});
const totalAmount = computed(() => {
  return orders.value.reduce((sum, order) => sum + order.price_paid, 0);
});

async function getCreditPackage() {
  try {
    const { data } = await getUserCreditPackage();
    orders.value = data;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCreditPackage] error : ${msg}`);
  }
}

onMounted(() => {
  getCreditPackage();
});
</script>
