<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-modal-overlay"
    @click="closeCourseModal"
  >
    <div
      class="bg-primary-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-scale-in max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <button
        @click="closeCourseModal"
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

      <div class="mb-6">
        <h3 class="text-2xl font-bold text-primary-0">
          {{ isEditMode ? "編輯課程" : "新增課程" }}
        </h3>
      </div>

      <div class="space-y-6">
        <div>
          <label
            for="courseName"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            課程名稱 <span class="text-red-400">*</span>
          </label>
          <input
            id="courseName"
            v-model="courseInfo.name"
            type="text"
            required
            class="w-full px-4 py-3 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 transition-all duration-300 placeholder-primary-400"
            placeholder="請輸入課程名稱"
          />
        </div>

        <div>
          <label
            for="meetingUrl"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            會議連結 <span class="text-red-400">*</span>
          </label>
          <input
            id="meetingUrl"
            v-model="courseInfo.meeting_url"
            type="url"
            required
            class="w-full px-4 py-3 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 transition-all duration-300 placeholder-primary-400"
            placeholder="請輸入會議連結（例如：https://...）"
          />
        </div>

        <div>
          <label
            for="description"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            課程簡介 <span class="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            v-model="courseInfo.description"
            rows="4"
            required
            class="w-full px-4 py-3 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 transition-all duration-300 resize-none placeholder-primary-400"
            placeholder="請輸入課程簡介"
          ></textarea>
        </div>

        <div>
          <label
            for="skillId"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            課程類別 <span class="text-red-400">*</span>
          </label>
          <select
            id="skillId"
            v-model="courseInfo.skill_id"
            required
            class="w-full px-4 py-3 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 hover:border-secondary-800/50 hover:bg-primary-600 transition-all duration-300 cursor-pointer"
          >
            <option value="" disabled>請選擇課程類別</option>
            <option
              v-for="skill in skillList"
              :key="skill.id"
              :value="skill.id"
            >
              {{ skill.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="courseDate"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            選擇上課日期 <span class="text-red-400">*</span>
          </label>
          <div class="relative group">
            <input
              id="courseDate"
              v-model="selectedDate"
              type="date"
              required
              class="w-full px-4 py-3 pr-12 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 focus-within:border-secondary-800 transition-all duration-300 scheme-dark cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <svg
              class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-primary-0 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <div>
          <label
            for="timeSlot"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            選擇時段 <span class="text-red-400">*</span>
          </label>
          <select
            id="timeSlot"
            v-model="selectedTimeSlot"
            required
            class="w-full px-4 py-3 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 transition-all duration-300 cursor-pointer"
          >
            <option value="" disabled>請選擇時段</option>
            <option
              v-for="slot in timeSlots"
              :key="slot.value"
              :value="slot.value"
            >
              {{ slot.label }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="maxParticipants"
            class="block text-lg font-semibold text-primary-0 mb-2"
          >
            最大人數 <span class="text-red-400">*</span>
          </label>
          <input
            id="maxParticipants"
            v-model.number="courseInfo.max_participants"
            type="number"
            min="1"
            required
            class="w-full px-4 py-3 text-lg border-2 border-primary-600 bg-primary-700 text-primary-0 rounded-lg focus:outline-none focus:border-secondary-800 transition-all duration-300 placeholder-primary-400"
            placeholder="請輸入最大人數"
          />
        </div>

        <div class="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            @click="closeCourseModal"
            class="px-6 py-3 text-lg font-medium text-primary-0 bg-primary-700 border-2 border-primary-600 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-600/30 transition-all duration-300"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleCourse"
            class="px-6 py-3 text-lg font-medium text-primary-900 bg-secondary-800 rounded-lg hover:bg-secondary-700 active:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-800/30 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {{ isEditMode ? "更新課程" : "新增課程" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { getSkills, getCoachCourse } from "../api/index.js";
import {
  formatLocalDate,
  formatTimeRange,
  toUTC,
} from "../utils/formatDateTime.js";

const props = defineProps({
  courseId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "closeCourseModal",
  "submitCourse",
  "addCourse",
  "updateCourse",
]);

const skillList = ref([]);
const selectedDate = ref("");
const selectedTimeSlot = ref("");
const courseInfo = ref({
  skill_id: "",
  name: "",
  description: "",
  start_at: "",
  end_at: "",
  max_participants: 1,
  meeting_url: "",
});

const isEditMode = computed(() => {
  return props.courseId !== "";
});
const timeSlots = computed(() => {
  const slots = [];
  const slotDuration = 50;

  for (let hour = 9; hour <= 21; hour++) {
    // 跳過 12:00~13:00 午休時間
    if (hour === 12) continue;

    const start = `${String(hour).padStart(2, "0")}:00`;
    const endHour = hour;
    const endMin = slotDuration;
    const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(
      2,
      "0"
    )}`;

    slots.push({
      value: `${start} ~ ${end}`,
      label: `${start} ~ ${end}`,
    });
  }

  return slots;
});

function closeCourseModal() {
  emit("closeCourseModal");
}

function handleCourse() {
  setCourseDateTime();
  if (isEditMode.value) {
    emit("updateCourse", courseInfo.value, props.courseId);
  } else {
    emit("addCourse", courseInfo.value);
  }
}

function setCourseDateTime() {
  const [start, end] = selectedTimeSlot.value.split("~").map((t) => t.trim());

  courseInfo.value.start_at = toUTC(`${selectedDate.value} ${start}`);
  courseInfo.value.end_at = toUTC(`${selectedDate.value} ${end}`);
}

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

async function getCoachCourseInfo() {
  try {
    const { data } = await getCoachCourse(props.courseId);

    courseInfo.value.skill_id = data.skill_id;
    courseInfo.value.name = data.name;
    courseInfo.value.description = data.description;
    courseInfo.value.start_at = data.start_at;
    courseInfo.value.end_at = data.end_at;
    courseInfo.value.max_participants = data.max_participants;
    courseInfo.value.meeting_url = data.meeting_url;

    selectedDate.value = formatLocalDate(data.start_at);
    selectedTimeSlot.value = formatTimeRange(data.start_at, data.end_at);
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCoachCourseInfo] error : ${msg}`);
  }
}

onMounted(() => {
  // 鎖定 body 和 html 的滾動
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  getSkillList();
  if (isEditMode.value) getCoachCourseInfo();
});

onUnmounted(() => {
  // 恢復 body 和 html 的滾動
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
});
</script>

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

/* 讓日期選擇器點擊任何地方都能開啟日曆 */
input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
}
</style>
