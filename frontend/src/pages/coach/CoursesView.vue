<template>
  <div class="bg-primary-900 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex justify-between items-start">
        <div>
          <h3 class="text-4xl font-bold">
            <span class="text-primary-0">課程</span>
            <span class="text-secondary-800">管理</span>
          </h3>
          <p class="text-primary-300 text-lg mt-2 leading-relaxed">
            管理您開設的所有課程
          </p>
        </div>
      <button
        @click="openCourseModal"
        class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-900 bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-800 transition-colors whitespace-nowrap"
      >
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        新增課程
      </button>
    </div>

      <div
        v-if="courseList.length === 0"
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 class="mt-2 text-2xl font-medium text-primary-0">尚無課程</h3>
        <p class="mt-1 text-lg text-primary-300">您還沒有開設任何課程</p>
      </div>

      <div v-else class="bg-primary-800 rounded-lg shadow-lg overflow-hidden border border-primary-600">
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-primary-600">
            <thead class="bg-primary-700">
              <tr>
                <th
                  scope="col"
                  class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap"
                >
                  課程名稱
                </th>
                <th
                  scope="col"
                  class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap"
                >
                  授課時段
                </th>
                <th
                  scope="col"
                  class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap"
                >
                  預約人數
                </th>
                <th
                  scope="col"
                  class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap"
                >
                  課程狀態
                </th>
                <th
                  scope="col"
                  class="px-3 py-4 text-left text-lg font-semibold text-primary-300 uppercase tracking-wider whitespace-nowrap"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-primary-800 divide-y divide-primary-600">
              <tr
                v-for="course in courseList"
                :key="course.id"
                class="hover:bg-primary-700 transition-colors"
              >
                <td class="px-3 py-4">
                  <div class="text-lg font-medium text-primary-0">
                    {{ course.name }}
                  </div>
                </td>
                <td class="px-3 py-4">
                  <div class="text-lg text-primary-0">
                    {{
                      formatCoachCourseDateTime(course.start_at, course.end_at)
                    }}
                  </div>
                </td>
                <td class="px-3 py-4">
                  <div class="text-lg text-primary-0">
                    {{ course.participants }} / {{ course.max_participants }} 人
                  </div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(course.status)"
                    class="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium"
                  >
                    {{ course.status }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openCourseModal(course.id)"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-900 bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-800 transition-colors"
                    >
                      編輯
                    </button>
                    <a
                      :href="course.meeting_url || '#'"
                      :target="course.meeting_url ? '_blank' : ''"
                      :class="[
                        'inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md transition-colors',
                        course.meeting_url
                          ? 'text-primary-900 bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 cursor-pointer'
                          : 'text-primary-400 bg-primary-700 cursor-not-allowed pointer-events-none',
                      ]"
                    >
                      直播
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden">
          <div
            v-for="course in courseList"
            :key="course.id"
            class="border-b border-primary-600 p-4 last:border-b-0"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-primary-0">
                {{ course.name }}
              </h3>
              <span
                :class="getStatusClass(course.status)"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-base font-medium"
              >
                {{ course.status }}
              </span>
            </div>
            <div class="space-y-2 text-lg">
              <div class="flex justify-between items-center">
                <span class="text-primary-300 whitespace-nowrap">授課時段</span>
                <span class="text-primary-0 text-right">{{
                  formatCoachCourseDateTime(course.start_at, course.end_at)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-primary-300">預約人數</span>
                <span class="text-primary-0"
                  >{{ course.participants }} /
                  {{ course.max_participants }} 人</span
                >
              </div>
            </div>
            <div class="mt-4 flex flex-col gap-2">
              <button
                @click="openCourseModal(course.id)"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-900 bg-secondary-800 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-800 transition-colors"
              >
                編輯
              </button>
              <a
                :href="course.meeting_url"
                target="_blank"
                class="'text-primary-900 bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 cursor-pointer'"
              >
                直播
              </a>
            </div>
          </div>
        </div>
      </div>

      <CourseModal
        v-if="courseModal"
        :courseId="courseId"
        @closeCourseModal="closeCourseModal"
        @addCourse="addCourse"
        @updateCourse="updateCourse"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import {
  getAdminCoachCourses,
  postCourses,
  putCourses,
} from "../../api/index.js";
import { formatCoachCourseDateTime } from "../../utils/formatDateTime.js";
import CourseModal from "../../components/CourseModal.vue";
import swalHandler from "../../utils/swalHandler.js";

const { proxy } = getCurrentInstance();

const courseList = ref([]);
const courseModal = ref(false);
const courseId = ref("");

function getStatusClass(status) {
  const statusClasses = {
    尚未開始: "bg-info-200 text-info-700",
    進行中: "bg-success-200 text-success-700",
    已結束: "bg-primary-600 text-primary-0",
  };
  return statusClasses[status];
}

function openCourseModal(id) {
  if (typeof id === "string") {
    courseId.value = id;
  }

  courseModal.value = true;
}

function closeCourseModal() {
  courseId.value = "";
  courseModal.value = false;
}

async function addCourse(courseInfo) {
  try {
    const { status } = await postCourses(courseInfo);
    if (status === "success") {
      swalHandler(proxy.$swal, "新增課程成功");
      getCoachCourseList();
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

    throw new Error(`[getCoachCourseList] error : ${msg}`);
  } finally {
    closeCourseModal();
  }
}

async function updateCourse(courseInfo, courseId) {
  try {
    const { status } = await putCourses(courseInfo, courseId);
    if (status === "success") {
      swalHandler(proxy.$swal, "更新課程成功");
      getCoachCourseList();
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

    throw new Error(`[getCoachCourseList] error : ${msg}`);
  } finally {
    closeCourseModal();
  }
}

async function getCoachCourseList() {
  try {
    const { data } = await getAdminCoachCourses();

    courseList.value = data;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCoachCourseList] error : ${msg}`);
  }
}

onMounted(() => {
  getCoachCourseList();
});
</script>
