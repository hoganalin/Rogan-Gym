<template>
  <div
    class="bg-primary-900 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20"
  >
    <div
      class="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-7xl mx-auto"
    >
      <div class="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
        <div>
          <h3 class="text-4xl font-bold mb-4">
            <span class="text-primary-0">課程</span>
            <span class="text-secondary-800">儀錶板</span>
          </h3>
          <p class="text-primary-300 text-lg leading-relaxed">
            在這裡，您可以輕鬆查看已預約的課堂數量、已完成的課堂以及總課堂數。<br />這些數據將幫助您更好地規劃未來的健身計畫。
          </p>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-8 sm:gap-12 mt-8 justify-center"
        >
          <div class="flex-1">
            <h5 class="text-3xl font-semibold text-primary-0 mb-2">已預約</h5>
            <p class="text-lg text-primary-400 mb-3">您已預約的課堂數量</p>
            <p class="text-6xl font-bold text-secondary-800">
              {{ userCoursesInfo.credit_usage
              }}<span class="text-2xl ml-1">堂</span>
            </p>
          </div>

          <div class="flex-1">
            <h5 class="text-3xl font-semibold text-primary-0 mb-2">剩餘課堂</h5>
            <p class="text-lg text-primary-400 mb-3">您還有的課堂數量</p>
            <p class="text-6xl font-bold text-success-600">
              {{ userCoursesInfo.credit_remain
              }}<span class="text-2xl ml-1">堂</span>
            </p>
          </div>
        </div>
      </div>

      <div class="hidden lg:block lg:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
          alt="數據儀表板"
          class="w-full h-auto rounded-lg shadow-lg object-cover"
        />
      </div>
    </div>
    <div class="mt-24">
      <div class="text-center mb-12">
        <p class="text-xl text-primary-400 mb-2">課程</p>
        <h3 class="text-4xl font-bold text-primary-0 mb-3">時間表</h3>
        <p class="text-xl text-primary-300">
          查看您即將參加的課程安排，讓您的健身計畫更有條理！
        </p>
        <ul class="flex flex-wrap gap-3 justify-center mt-8 mb-8">
          <li v-for="date in Object.keys(courseGroupingTable)" :key="date">
            <button
              @click="changeDate(date)"
              :class="{
                'border-2 border-secondary-800 text-secondary-800 bg-secondary-800/10':
                  date === currentDate,
              }"
              class="inline-block px-6 py-3 border-2 border-primary-600 text-primary-300 font-semibold rounded-lg transition-colors cursor-pointer hover:border-secondary-800 hover:text-secondary-800"
            >
              {{ formatLocalWeekDate(date) }}
            </button>
          </li>
        </ul>

        <ul class="max-w-5xl mx-auto space-y-4 px-4 sm:px-6">
          <li
            v-for="course in courseGroupingTable[currentDate]"
            :key="course.course_id"
            class="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-primary-800 rounded-xl shadow-md border border-primary-600 hover:shadow-lg transition-shadow min-h-[200px] sm:min-h-[180px] md:min-h-[160px]"
            :class="{
              'bg-primary-600 border-primary-500 opacity-90':
                course.cancelled_at !== null,
              'bg-primary-700 border-primary-500':
                getCourseButtonState(course) === 'finished',
            }"
          >
            <div class="flex-1 text-left">
              <p
                class="text-xl sm:text-2xl font-bold mb-1"
                :class="{
                  'text-primary-300':
                    course.cancelled_at !== null ||
                    getCourseButtonState(course) === 'finished',
                  'text-primary-0':
                    course.cancelled_at === null &&
                    getCourseButtonState(course) !== 'finished',
                }"
              >
                {{ course.name }}
              </p>
              <p
                class="text-base sm:text-lg"
                :class="{
                  'text-primary-400':
                    course.cancelled_at !== null ||
                    getCourseButtonState(course) === 'finished',
                  'text-primary-300':
                    course.cancelled_at === null &&
                    getCourseButtonState(course) !== 'finished',
                }"
              >
                {{ formatTimeRange(course.start_at, course.end_at) }}
              </p>
            </div>
            <div class="flex-1 lg:flex lg:justify-center">
              <p
                class="text-xl sm:text-2xl font-bold"
                :class="{
                  'text-primary-300':
                    course.cancelled_at !== null ||
                    getCourseButtonState(course) === 'finished',
                  'text-primary-0':
                    course.cancelled_at === null &&
                    getCourseButtonState(course) !== 'finished',
                }"
              >
                {{ course.coach_name }} 教練
              </p>
            </div>
            <div class="flex-1 lg:flex lg:justify-end">
              <button
                v-if="course.cancelled_at !== null"
                class="w-full lg:w-60 px-4 sm:px-6 py-3 bg-disabled-400 text-primary-0 font-semibold rounded-lg cursor-not-allowed shadow-md text-sm sm:text-base"
                disabled
              >
                課程已取消
              </button>
              <a
                v-else-if="getCourseButtonState(course) === 'live'"
                class="w-full lg:w-60 px-4 sm:px-6 py-3 bg-success-600 text-primary-0 font-semibold rounded-lg hover:bg-success-700 transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                :href="course.meeting_url"
                target="_blank"
              >
                <span
                  class="w-2 h-2 bg-primary-0 rounded-full animate-pulse"
                ></span>
                上課中，進入直播教室
              </a>
              <div
                v-else-if="getCourseButtonState(course) === 'upcoming'"
                class="flex flex-col gap-2 w-full lg:w-60"
              >
                <button
                  class="w-full px-4 sm:px-6 py-3 bg-secondary-800 text-primary-0 font-semibold rounded-lg hover:bg-secondary-700 transition-colors shadow-md text-sm sm:text-base"
                >
                  即將授課
                </button>
                <button
                  @click="deleteUserCourse(course.course_id)"
                  class="w-full px-4 sm:px-6 py-3 bg-warning-400 text-primary-900 font-semibold rounded-lg hover:bg-warning-500 transition-colors shadow-md text-sm sm:text-base"
                >
                  取消課程
                </button>
              </div>
              <button
                v-else
                class="w-full px-4 sm:px-6 py-3 bg-info-200 text-info-700 font-semibold rounded-lg transition-colors shadow-sm text-sm sm:text-base cursor-not-allowed"
              >
                課程已結束
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { getUserCourses, deleteCourse } from "../../api/index.js";
import {
  formatLocalDate,
  formatLocalWeekDate,
  formatTimeRange,
} from "../../utils/formatDateTime.js";
import {
  isCourseInProgress,
  isCourseUpcoming,
} from "../../utils/timeComparison.js";
import { useCurrentTime } from "../../composables/useNow.js";
import swalHandler from "../../utils/swalHandler.js";

const { proxy } = getCurrentInstance();

const { currentTime } = useCurrentTime();
const userCoursesInfo = ref({});
const courseGroupingTable = ref({});
const currentDate = ref(null);

function getCourseButtonState(course) {
  if (isCourseInProgress(course.start_at, course.end_at, currentTime.value)) {
    return "live";
  }

  if (isCourseUpcoming(course.start_at, currentTime.value)) {
    return "upcoming";
  }

  return "finished";
}

function getCourseGroupingTable(courseBooking, isInitialLoad) {
  if (!courseBooking) {
    courseGroupingTable.value = {};
    return;
  }

  const grouped = {};

  userCoursesInfo.value.course_booking.forEach((course, index) => {
    const dateKey = formatLocalDate(course.start_at);
    if (index === 0 && isInitialLoad) {
      currentDate.value = dateKey;
    }
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(course);
  });
  courseGroupingTable.value = grouped;
}

async function getUserCoursesInfo(isInitialLoad) {
  try {
    const { data } = await getUserCourses();
    userCoursesInfo.value = data;
    getCourseGroupingTable(data.course_booking, isInitialLoad);
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getUserCoursesInfo] error : ${msg}`);
  }
}

async function deleteUserCourse(id) {
  try {
    const { status } = await deleteCourse(id);

    if (status === "success") {
      swalHandler(proxy.$swal, "課程取消成功");
      getUserCoursesInfo();
    }
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[deleteUserCourse] error : ${msg}`);
  }
}

function changeDate(dateKey) {
  currentDate.value = dateKey;
}

onMounted(() => {
  getUserCoursesInfo(true);
});
</script>
