<template>
  <div class="bg-primary-900 min-h-screen">
    <div class="container py-16 mx-auto px-4 md:px-8 lg:px-20">
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-8 text-primary-0">專業健身教練</h2>
        <p class="text-xl text-primary-300">
          我們的教練團隊擁有豐富的經驗和專業知識，祝您達成健身目標。
        </p>
      </div>

      <div class="text-center mb-12">
        <p class="text-xl text-primary-400 mb-2">專業</p>
        <h3 class="text-4xl font-bold mb-3">
          <span class="text-secondary-800">教練</span>
          <span class="text-primary-0">團隊</span>
        </h3>
        <p class="text-xl text-primary-300">選擇最適合你的專業教練</p>
      </div>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <li
          class="bg-primary-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group flex flex-col border border-primary-600"
          v-for="coach in coachList"
          :key="coach.coach.id"
        >
          <div class="relative overflow-hidden aspect-4/3 bg-primary-700">
            <img
              :src="coach.coach.profile_image_url"
              :alt="coach.user.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>
          <div class="p-6 text-center flex flex-col flex-1">
            <p class="text-2xl font-bold text-primary-0 mb-3">
              {{ coach.user.name }}
            </p>
            <h6 class="text-lg text-primary-300 mb-3">
              {{ coach.coach.description }}
            </h6>
            <button
              @click="goToCoachDetail(coach.coach.id)"
              class="mt-auto w-[104px] h-12 px-5 py-3 rounded bg-secondary-800 text-base font-medium leading-[150%] text-center text-primary-900 hover:opacity-90 transition-all duration-300 self-center whitespace-nowrap"
            >
              前往了解
            </button>
          </div>
        </li>
      </ul>
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
        <div class="flex-1">
          <p class="text-2xl text-primary-400 mb-2">專業</p>
          <h5 class="text-3xl font-bold text-primary-0 mb-8">
            選擇最適合你的健身教練
          </h5>
          <p class="text-lg font-bold text-primary-300 leading-relaxed mb-8">
            我們的教練擁有豐富的專業知識和經驗，能夠根據你的需求提供量身訂製的健身計畫。無論你是初學者還是進階者，這裡都有適合你的專家。
          </p>
          <div class="flex">
            <ul class="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <li>
                <img
                  src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=96&h=96&fit=crop"
                  alt="專業技能"
                  class="w-24 h-24 rounded-lg bg-primary-700 shrink-0 object-cover"
                />
                <div class="mt-4">
                  <h6 class="text-xl font-bold text-primary-0 mb-2">
                    專業技能
                  </h6>
                  <p class="font-bold text-primary-400 leading-relaxed">
                    每位教練都具備獨特的專業技能，祝你達成健身的目標。
                  </p>
                </div>
              </li>
              <li>
                <img
                  src="https://images.unsplash.com/photo-1614928228253-dc09cbc3b11c?w=96&h=96&fit=crop"
                  alt="成就展示"
                  class="w-24 h-24 rounded-lg bg-primary-700 shrink-0 object-cover"
                />
                <div class="mt-4">
                  <h6 class="text-xl font-bold text-primary-0 mb-2">
                    成就展示
                  </h6>
                  <p class="font-bold text-primary-400 leading-relaxed">
                    我們的教練在各大賽事中獲得過多項獎項，實力卓越。
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="flex-1 lg:max-w-[50%]">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop"
            alt="教練展示專業瑜珈動作"
            class="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>
      <div class="text-center mb-8">
        <p class="text-xl text-primary-400 mb-2">學員心聲</p>
        <h3 class="text-4xl font-bold mb-3 text-primary-0">真實評價</h3>
      </div>
      <div
        class="relative w-full lg:w-2/3 mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 to-primary-700 mb-16 shadow-xl border border-primary-600"
      >
        <div
          class="relative h-96 md:h-[450px] flex items-center justify-center px-4 py-12"
        >
          <div
            v-for="(slide, index) in carouselSlides"
            :key="index"
            :class="[
              'absolute inset-0 flex items-center justify-center transition-opacity duration-500',
              currentSlide === index ? 'opacity-100' : 'opacity-0',
            ]"
          >
            <div
              class="text-center px-6 md:px-12 max-w-2xl flex flex-col items-center justify-center h-full"
            >
              <div class="flex gap-2 md:gap-3">
                <svg
                  v-for="star in 5"
                  :key="star"
                  class="w-8 h-8 md:w-10 md:h-10"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#F36A0E"
                  />
                </svg>
              </div>

              <div class="h-24 md:h-28 flex items-center">
                <p
                  class="text-lg font-bold md:text-xl text-primary-300 leading-relaxed italic"
                >
                  「{{ slide.review }}」
                </p>
              </div>

              <div
                class="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 shadow-lg"
              >
                <img
                  :src="slide.coachImage"
                  :alt="slide.coachName"
                  class="w-full h-full object-cover"
                />
              </div>

              <h4 class="text-xl md:text-2xl font-bold text-primary-0 mb-2">
                {{ slide.coachName }}
              </h4>

              <p class="text-base md:text-lg text-primary-400">
                {{ slide.coachDescription }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-10"
        >
          <button
            v-for="(slide, index) in carouselSlides"
            :key="index"
            @click="goToSlide(index)"
            :class="[
              'rounded-full transition-all duration-300',
              currentSlide === index
                ? 'bg-secondary-800 w-4 md:w-6 h-2 md:h-2.5'
                : 'bg-primary-500 w-2 md:w-2.5 h-2 md:h-2.5 hover:bg-primary-400',
            ]"
            :aria-label="`前往第 ${index + 1} 張`"
          ></button>
        </div>
      </div>
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
        <div class="flex-1">
          <h5 class="text-3xl font-bold text-primary-0 mb-8">
            探索我們的專業教練
          </h5>
          <p class="text-lg font-bold text-primary-300 leading-relaxed mb-8">
            立即與客服聯繫，為你精準匹配最合適的專業教練。
          </p>
          <a
            href="tel:+88622298332"
            class="text-xl font-bold text-secondary-800 hover:underline mt-8"
            >聯絡客服：(02)229-8332</a
          >
        </div>
        <div class="flex-1 lg:max-w-[50%]">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop"
            alt="健身圖片"
            class="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getCoaches, getCoachDetail } from "../../api/index.js";

const router = useRouter();

const coachList = ref([]);

const carouselSlides = [
  {
    review: "這位教練的專業指導讓我在短時間內看到了明顯的進步!",
    coachImage:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop",
    coachName: "張大明",
    coachDescription: "專注重訓技術與肌肉控制的專業導師",
  },
  {
    review: "教練非常耐心，每個動作都會仔細指導，讓我重新找回運動的信心",
    coachImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    coachName: "李小華",
    coachDescription: "相信柔軟與力量能共存的靜心實踐家",
  },
  {
    review: "跟著教練訓練三個月，不僅體態改善了，整個人的精神狀態也變得更好",
    coachImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    coachName: "王建國",
    coachDescription: "專注爆發力與穩定度訓練的運動導師",
  },
];

const currentSlide = ref(0);
let carouselInterval = null;

function goToCoachDetail(coachId) {
  router.push(`/coaches/${coachId}`);
}

// 前往指定幻燈片
function goToSlide(index) {
  currentSlide.value = index;
  // 重啟自動播放
  stopCarousel();
  startCarousel();
}

// 下一張
function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % carouselSlides.length;
}

// 自動播放
function startCarousel() {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 3000); // 每3秒切換一次
}

// 停止自動播放
function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

async function getCoachesList() {
  try {
    const { data } = await getCoaches(6, 1);
    return data;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCoachCourseList] error : ${msg}`);
  }
}

async function getCoachDetailList() {
  try {
    const coaches = await getCoachesList();

    if (!coaches || coaches.length === 0) {
      coachList.value = [];
      return;
    }

    const results = await Promise.allSettled(
      coaches.map((coach) => getCoachDetail(coach.id))
    );

    const coachesWithDetails = results.map((result) => {
      if (result.value.status === "success") {
        return {
          ...result.value.data,
        };
      }
    });

    coachList.value = coachesWithDetails;
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { message } = error.response.data;
      msg = message;
    }

    throw new Error(`[getCoachDetailList] error : ${msg}`);
  }
}

onMounted(() => {
  startCarousel();
  getCoachDetailList();
});

onUnmounted(() => {
  stopCarousel();
});
</script>
