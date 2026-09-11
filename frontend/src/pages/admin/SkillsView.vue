<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h3 class="text-4xl font-bold text-primary-0">教練技能管理</h3>
      <p class="mt-2 text-lg text-primary-300 leading-relaxed">
        集中管理所有教練技能項目，輕鬆新增或刪除技能分類
      </p>
    </div>

    <div class="mb-6 flex items-center gap-4 justify-center">
      <input
        v-model="newSkillName"
        type="text"
        placeholder="請輸入技能名稱"
        class="w-40 sm:w-64 px-4 py-2 border-2 border-primary-600 rounded-lg outline-none focus:border-secondary-800 bg-primary-800 text-primary-0 placeholder-primary-400"
        @keyup.enter="addSkill"
      />
      <button
        @click="addSkill"
        :disabled="!newSkillName.trim()"
        class="px-6 py-2 bg-secondary-800 text-primary-900 rounded-lg hover:opacity-90 transition-colors disabled:bg-primary-600 disabled:cursor-not-allowed disabled:text-primary-0"
      >
        新增技能
      </button>
    </div>

    <div
      class="bg-primary-800 rounded-lg shadow-lg overflow-hidden max-w-xl mx-auto border border-primary-600"
    >
      <div
        v-if="skillList.length === 0"
        class="text-center py-12 text-primary-300"
      >
        <svg
          class="mx-auto h-12 w-12 text-primary-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="text-lg">目前還沒有任何技能</p>
        <p class="text-sm mt-2">請使用上方表單新增第一個技能</p>
      </div>

      <table v-else class="min-w-full divide-y divide-primary-600">
        <thead class="bg-primary-700">
          <tr>
            <th
              scope="col"
              class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap"
            >
              技能名稱
            </th>
            <th
              scope="col"
              class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap w-24"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-primary-800 divide-y divide-primary-600">
          <tr
            v-for="skill in skillList"
            :key="skill.id"
            class="hover:bg-primary-700 transition-colors"
          >
            <td class="px-3 py-4">
              <div class="text-lg font-medium text-primary-0">
                {{ skill.name }}
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <button
                @click="removeSkill(skill.id)"
                class="text-red-400 hover:text-red-500 font-medium text-lg"
                title="刪除技能"
              >
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { getSkills, postSkill, deleteSkill } from "../../api/index.js";
import swalHandler from "../../utils/swalHandler.js";

const { proxy } = getCurrentInstance();

const skillList = ref([]);
const newSkillName = ref("");

async function getSkillList() {
  try {
    const { data } = await getSkills();
    skillList.value = data;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getSkillList] error : ${msg}`);
  }
}

async function addSkill() {
  try {
    const { status } = await postSkill({
      name: newSkillName.value,
    });

    if (status === "success") {
      getSkillList();
      swalHandler(proxy.$swal, "新增技能成功");
    }
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { status, message } = error.response.data;
      msg = message;

      if (status === "failed") {
        swalHandler(proxy.$swal, message);
        return;
      }
    }

    throw new Error(`[getSkillList] error : ${msg}`);
  } finally {
    newSkillName.value = "";
  }
}

async function removeSkill(id) {
  try {
    const { status } = await deleteSkill(id);

    if (status === "success") {
      getSkillList();
      swalHandler(proxy.$swal, "刪除技能成功");
    }
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { status, message } = error.response.data;
      msg = message;

      if (status === "failed") {
        swalHandler(proxy.$swal, message);
        return;
      }
    }

    throw new Error(`[getSkillList] error : ${msg}`);
  }
}

onMounted(() => {
  getSkillList();
});
</script>
