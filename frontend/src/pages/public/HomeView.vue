<template>
  <div>
    <section
      class="relative h-[500px] md:h-[755px] bg-primary-900 overflow-hidden"
    >
      <img
        src="/banner.png"
        alt="Banner"
        class="absolute left-1/2 -translate-x-1/2 xl:left-auto xl:right-0 xl:translate-x-0 top-0 h-full min-w-full xl:min-w-0 xl:w-auto object-cover xl:object-contain object-center xl:object-right z-0"
      />
      <div class="absolute left-0 top-0 w-full h-full z-10">
        <div class="max-w-7xl mx-auto h-full px-4 md:px-8 2xl:px-0">
          <div class="max-w-2xl flex flex-col justify-center h-full">
            <h2
              class="text-[32px] md:text-[48px] lg:text-[64px] font-black leading-[120%] text-primary-0"
            >
              專業健身教練服務
            </h2>
            <h2
              class="text-[32px] md:text-[48px] lg:text-[64px] font-black leading-[120%] text-secondary-800 mb-4"
            >
              助你實現健康與活力
            </h2>
            <p
              class="text-[16px] md:text-[18px] lg:text-[20px] font-medium leading-[150%] text-primary-300 mb-6 md:mb-12"
            >
              我們提供多樣化的線上教練課程,無論你是初學者還是健身達人,
              都能找到適合自己的課程
            </p>
            <router-link
              to="/coaches"
              class="inline-flex items-center justify-center w-[136px] h-12 px-5 py-3 bg-secondary-800 text-primary-900 rounded gap-2"
            >
              尋找合適教練
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section
      class="pt-12 md:pt-16 lg:pt-20 pb-20 bg-primary-900 relative overflow-hidden"
    >
      <img
        src="/ellipse.png"
        alt="Ellipse Decoration"
        class="absolute -left-110 top-1/2 -translate-y-1/2 w-auto h-auto hidden lg:block"
      />
      <div class="max-w-7xl mx-auto px-4 md:px-8 2xl:px-0">
        <div class="text-center mb-8 md:mb-10 lg:mb-12">
          <p
            class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-1"
          >
            FITNESS CLASS
          </p>
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] text-center mb-3 md:mb-4"
          >
            <span class="text-primary-0">探索我們的</span>
            <span class="text-secondary-800">線上健身課程</span>
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            我們提供多樣化的健身課程,適合各種需求與目標。無論您是初學者還是有經驗的健身者,我們的課程將幫助您達成理想的健身效果
          </p>
        </div>

        <ul
          class="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-0 md:-space-x-6"
        >
          <li
            class="w-full md:w-[280px] lg:w-[350px] xl:w-[416px] h-[280px] overflow-hidden flex items-start justify-center relative group cursor-pointer [clip-path:polygon(40px_0,100%_0,calc(100%-40px)_100%,0_100%)]"
          >
            <img
              src="/people-01.png"
              alt="Fitness Class 1"
              class="w-[596px] h-[363px] -mt-6"
            />
            <div
              class="absolute inset-0 bg-linear-to-b from-[rgba(99,46,11,0.53)] to-[rgba(252,132,54,0.53)] group-hover:bg-none group-hover:bg-[#F3690E9E]"
            ></div>

            <p
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold leading-[120%] text-primary-0 z-10 group-hover:hidden"
            >
              專業教練指導
            </p>

            <div
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden group-hover:flex flex-col items-center"
            >
              <img src="/dumbbel-white.svg" alt="Dumbbell" class="mb-10" />
              <p class="text-2xl font-bold leading-[120%] text-primary-0 mb-2">
                專業教練指導
              </p>
              <p
                class="text-base font-medium leading-[150%] text-neutral-200 text-center px-4 whitespace-nowrap"
              >
                我們的教練有專業知識,能提供個性化的指導
              </p>
            </div>
          </li>
          <li
            class="w-full md:w-[280px] lg:w-[350px] xl:w-[416px] h-[280px] overflow-hidden flex items-center justify-center relative group cursor-pointer [clip-path:polygon(40px_0,100%_0,calc(100%-40px)_100%,0_100%)]"
          >
            <img
              src="/people-02.png"
              alt="Fitness Class 2"
              class="w-[596px] h-[363px]"
            />
            <div
              class="absolute inset-0 bg-linear-to-b from-[rgba(99,46,11,0.53)] to-[rgba(252,132,54,0.53)] group-hover:bg-none group-hover:bg-[#F3690E9E]"
            ></div>

            <p
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold leading-[120%] text-primary-0 z-10 group-hover:hidden"
            >
              靈活的課程安排
            </p>

            <div
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden group-hover:flex flex-col items-center"
            >
              <img src="/dumbbel-white.svg" alt="Dumbbell" class="mb-10" />
              <p class="text-2xl font-bold leading-[120%] text-primary-0 mb-2">
                靈活的課程安排
              </p>
              <p
                class="text-base font-medium leading-[150%] text-neutral-200 text-center px-4 whitespace-nowrap"
              >
                您可以根據自己的時間選擇課程靈活方便
              </p>
            </div>
          </li>
          <li
            class="w-full md:w-[280px] lg:w-[350px] xl:w-[416px] h-[280px] overflow-hidden flex items-center justify-center relative group cursor-pointer [clip-path:polygon(40px_0,100%_0,calc(100%-40px)_100%,0_100%)]"
          >
            <img
              src="/people-03.png"
              alt="Fitness Class 3"
              class="w-[596px] h-[363px]"
            />
            <div
              class="absolute inset-0 bg-linear-to-b from-[rgba(99,46,11,0.53)] to-[rgba(252,132,54,0.53)] group-hover:bg-none group-hover:bg-[#F3690E9E]"
            ></div>

            <p
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold leading-[120%] text-primary-0 z-10 group-hover:hidden"
            >
              社群互動
            </p>

            <div
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden group-hover:flex flex-col items-center"
            >
              <img src="/dumbbel-white.svg" alt="Dumbbell" class="mb-10" />
              <p class="text-2xl font-bold leading-[120%] text-primary-0 mb-2">
                社群互動
              </p>
              <p
                class="text-base font-medium leading-[150%] text-neutral-200 text-center px-4 whitespace-nowrap"
              >
                與其他學員交流分享,共同進步成長
              </p>
            </div>
          </li>
        </ul>

        <div
          class="flex flex-row justify-center items-center gap-12 sm:gap-6 mt-8 md:mt-10 lg:mt-12"
        >
          <button
            class="w-[104px] h-12 px-5 py-3 rounded border border-primary-300 text-sm md:text-base font-medium leading-[150%] text-primary-300 text-center whitespace-nowrap"
          >
            瞭解更多
          </button>
          <button
            class="w-[104px] h-12 px-5 py-3 rounded bg-secondary-800 text-sm md:text-base font-medium leading-[150%] text-primary-900 text-center whitespace-nowrap"
          >
            前往報名
          </button>
        </div>
      </div>
    </section>

    <section class="py-20 bg-primary-900">
      <div class="max-w-7xl mx-auto px-4 md:px-8 2xl:px-0">
        <div class="flex flex-col md:flex-row items-center md:gap-12">
          <div class="mb-8 md:mb-0">
            <img
              src="/people-04.png"
              alt="Fitness Training"
              class="w-[526px] h-[474px] object-cover"
            />
          </div>

          <div class="flex-1 text-center md:text-left">
            <p class="text-base font-bold leading-[120%] text-primary-400 mb-1">
              ADVANTAGE
            </p>
            <h2 class="text-[40px] font-black leading-[120%]">
              <div class="text-secondary-800">體驗線上健身</div>
              <div class="text-primary-0">的全新方式</div>
            </h2>
            <p
              class="text-base font-normal leading-[150%] text-primary-300 mt-4 mb-4"
            >
              我們的線上教練課程提供靈活的時間安排，讓您隨時隨地都能健身。專業教練將根據您的需求提供個性化指導，助您達成健身目標
            </p>
            <div class="flex justify-center md:justify-start">
              <router-link
                to="/signup"
                class="inline-flex items-center justify-center w-[104px] h-12 px-5 py-3 rounded border border-primary-300 text-base font-medium leading-[150%] text-primary-0 whitespace-nowrap"
              >
                立即註冊
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-primary-900">
      <div class="max-w-7xl mx-auto px-4 md:px-8 2xl:px-0">
        <div class="text-center mb-8 md:mb-10 lg:mb-12">
          <p
            class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-1"
          >
            HOW IT WORKS
          </p>
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] text-center mb-3 md:mb-4"
          >
            <span class="text-primary-0">輕鬆上手，享受</span>
            <span class="text-secondary-800">健身之旅</span>
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            我們的網站提供簡單易用的介面，讓您輕鬆找到適合的教練和課程。無論您是新手還是有經驗的健身者，我們都有適合您的選擇
          </p>
        </div>

        <ul
          class="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-0"
        >
          <li class="flex flex-col items-center text-center max-w-[312px]">
            <img src="/group.svg" alt="Step 1" class="w-auto h-auto mb-10" />
            <div
              class="inline-flex items-center justify-center px-2 py-0.5 rounded-[20px] bg-secondary-800 mb-2"
            >
              <span
                class="text-xs font-medium leading-[150%] tracking-[0.02em] text-primary-0"
              >
                STEP 01
              </span>
            </div>
            <h3 class="text-xl font-black leading-[120%] text-primary-0 mb-2">
              註冊帳號，開始計畫
            </h3>
            <p class="text-base font-medium leading-[150%] text-primary-400">
              只需幾個步驟即可註冊並開始使用
            </p>
          </li>

          <li
            class="hidden md:block w-[198px] h-1 rounded-lg bg-gradient-to-r from-primary-900 to-secondary-800 mx-4"
            aria-hidden="true"
          ></li>

          <li class="flex flex-col items-center text-center max-w-[312px]">
            <img src="/dumbbel.svg" alt="Step 2" class="w-auto h-auto mb-10" />
            <div
              class="inline-flex items-center justify-center px-2 py-0.5 rounded-[20px] bg-secondary-800 mb-2"
            >
              <span
                class="text-xs font-medium leading-[150%] tracking-[0.02em] text-primary-0"
              >
                STEP 02
              </span>
            </div>
            <h3 class="text-xl font-black leading-[120%] text-primary-0 mb-2">
              選擇適合您的教練
            </h3>
            <p class="text-base font-medium leading-[150%] text-primary-400">
              瀏覽教練資料，根據專長找到最適合您的專家
            </p>
          </li>

          <li
            class="hidden md:block w-[198px] h-1 rounded-lg bg-gradient-to-r from-primary-900 to-secondary-800 mx-4"
            aria-hidden="true"
          ></li>

          <li class="flex flex-col items-center text-center max-w-[312px]">
            <img src="/group.svg" alt="Step 3" class="w-auto h-auto mb-10" />
            <div
              class="inline-flex items-center justify-center px-2 py-0.5 rounded-[20px] bg-secondary-800 mb-2"
            >
              <span
                class="text-xs font-medium leading-[150%] tracking-[0.02em] text-primary-0"
              >
                STEP 03
              </span>
            </div>
            <h3 class="text-xl font-black leading-[120%] text-primary-0 mb-2">
              輕鬆預約，隨時隨地
            </h3>
            <p class="text-base font-medium leading-[150%] text-primary-400">
              使用您的可用堂數，一鍵輕鬆預約課程
            </p>
          </li>
        </ul>
      </div>
    </section>

    <section class="py-20 bg-primary-900 relative">
      <div class="max-w-7xl mx-auto px-4 md:px-8 2xl:px-0">
        <div class="mb-8 md:mb-10 lg:mb-12">
          <p
            class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-1"
          >
            SERVICES
          </p>
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] mb-3 md:mb-4"
          >
            <span class="text-primary-0">探索我們的</span>
            <span class="text-secondary-800">線上健身服務</span>
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            我們提供多樣化的健身課程，適合各種需求的客戶。無論您是初學者還是進階者，我們的專業教練都能幫助您達成目標
          </p>
        </div>

        <ul class="flex flex-col gap-12 relative">
          <li class="flex flex-col md:flex-row items-center gap-12 relative">
            <div class="flex-shrink-0">
              <img
                src="/people-05.png"
                alt="個性化的教練配對"
                class="w-full md:w-[400px] lg:w-[526px] h-auto object-cover"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold leading-[120%] text-primary-0 mb-1">
                個性化的教練配對
              </h3>
              <div
                class="w-[198px] h-1 bg-gradient-to-r from-secondary-800 to-primary-900 mb-4"
              ></div>
              <p class="text-base font-normal leading-[150%] text-primary-300">
                透過 AI 輔助與人工篩選，為您配對最契合的專業教練，讓溝通無障礙
              </p>
            </div>
            <img
              src="/ellipse.png"
              alt="Decoration"
              class="absolute -right-180 top-1/3 -translate-y-1/2 w-auto h-auto hidden lg:block"
            />
          </li>

          <li
            class="flex flex-col md:flex-row-reverse items-center gap-12 relative"
          >
            <img
              src="/ellipse.png"
              alt="Decoration"
              class="absolute -left-210 top-full -translate-y-1/2 w-auto h-auto hidden lg:block"
            />
            <div class="flex-shrink-0">
              <img
                src="/people-06.png"
                alt="靈活的課程安排"
                class="w-full md:w-[400px] lg:w-[526px] h-auto object-cover"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold leading-[120%] text-primary-0 mb-1">
                靈活的課程安排
              </h3>
              <div
                class="w-[198px] h-1 bg-gradient-to-r from-secondary-800 to-primary-900 mb-4"
              ></div>
              <p class="text-base font-normal leading-[150%] text-primary-300">
                打破時間與地點的限制，依照您的生活節奏安排訓練，絕不錯過任何一次進步的機會
              </p>
            </div>
          </li>

          <li class="flex flex-col md:flex-row items-center gap-12 relative">
            <div class="flex-shrink-0">
              <img
                src="/people-07.png"
                alt="專業的健身知識分享"
                class="w-full md:w-[400px] lg:w-[526px] h-auto object-cover"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold leading-[120%] text-primary-0 mb-1">
                專業的健身知識分享
              </h3>
              <div
                class="w-[198px] h-1 bg-gradient-to-r from-secondary-800 to-primary-900 mb-4"
              ></div>
              <p class="text-base font-normal leading-[150%] text-primary-300">
                除了訓練，我們更提供科學化的飲食與恢復知識，透過我們的部落格獲取最新資訊
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="bg-primary-900">
      <div
        class="mx-auto px-4 md:px-8 2xl:px-0 bg-primary-800 py-[88px] [clip-path:polygon(0_88px,100%_0,100%_calc(100%-88px),0_100%)]"
      >
        <div class="text-center mb-8 mt-10 md:mb-6">
          <p
            class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-1"
          >
            MISSION
          </p>
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] text-center mb-1"
          >
            <div class="text-primary-0">我們的使命：</div>
            <div class="text-secondary-800">
              <span class="text-primary-0">推動</span>健康生活方式
            </div>
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            我們致力於提供高品質的線上健身教學，幫助每位客戶達成他們的健身目標
          </p>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            透過專業的教練團隊，我們確保每堂課程都充滿活力與成效
          </p>
        </div>
        <div class="flex flex-col items-center">
          <svg
            width="20"
            height="140"
            viewBox="0 0 20 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0L10 140M10 140L5 135M10 140L15 135"
              stroke="white"
              stroke-width="1"
            />
          </svg>
        </div>

        <div class="flex flex-col items-center gap-8 mt-8 mb-10">
          <div
            class="flex flex-row justify-center items-center gap-12 sm:gap-6"
          >
            <button
              class="w-[104px] h-12 px-5 py-3 rounded border border-primary-300 text-sm md:text-base font-medium leading-[150%] text-primary-300 text-center whitespace-nowrap"
            >
              瞭解更多
            </button>
            <button
              class="w-[104px] h-12 px-5 py-3 rounded bg-secondary-800 text-sm md:text-base font-medium leading-[150%] text-primary-900 text-center whitespace-nowrap"
            >
              前往報名
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 md:py-16 lg:py-20 bg-primary-900">
      <div class="max-w-7xl mx-auto px-4 md:px-8 2xl:px-0">
        <div class="text-center mb-8 md:mb-10 lg:mb-12">
          <div class="flex justify-center mb-4 md:mb-6">
            <svg
              v-for="i in 5"
              :key="i"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="rounded-[1px]"
            >
              <path
                d="M16 2L20.12 11.76L30.32 12.68L22.68 19.52L24.88 29.52L16 24.48L7.12 29.52L9.32 19.52L1.68 12.68L11.88 11.76L16 2Z"
                fill="#F36A0E"
              />
            </svg>
          </div>

          <p
            class="text-white text-xl md:text-2xl lg:text-[28px] font-bold leading-[120%] text-center mb-8 md:mb-10 lg:mb-12 px-4"
          >
            「這個健身平台讓我找到了理想的教練，<br class="hidden sm:block" />
            課程內容非常豐富～我很喜歡！」
          </p>
        </div>

        <ul
          class="flex flex-col lg:flex-row justify-center items-stretch gap-6 md:gap-8"
        >
          <li
            class="w-full lg:w-[416px] min-h-[152px] flex gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-primary-600"
          >
            <img
              src="/avatar-01.png"
              alt="Jenny"
              class="w-20 h-20 md:w-[104px] md:h-[104px] object-cover rounded shrink-0"
            />
            <div class="flex flex-col flex-1">
              <div class="flex mb-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.82L22.24 9.51L16.62 14.48L18.18 21.52L12 17.86L5.82 21.52L7.38 14.48L1.76 9.51L8.91 8.82L12 2Z"
                    fill="#F36A0E"
                  />
                </svg>
              </div>
              <h3
                class="text-white text-lg md:text-xl font-black leading-[120%] mb-1"
              >
                Jenny
              </h3>
              <p
                class="text-primary-400 text-sm md:text-base font-medium leading-[150%]"
              >
                我們的教練有專業知識,能提供個性化的指導
              </p>
            </div>
          </li>

          <li
            class="w-full lg:w-[416px] min-h-[152px] flex gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-primary-600"
          >
            <img
              src="/avatar-02.png"
              alt="Yuma"
              class="w-20 h-20 md:w-[104px] md:h-[104px] object-cover rounded shrink-0"
            />
            <div class="flex flex-col flex-1">
              <div class="flex mb-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.82L22.24 9.51L16.62 14.48L18.18 21.52L12 17.86L5.82 21.52L7.38 14.48L1.76 9.51L8.91 8.82L12 2Z"
                    fill="#F36A0E"
                  />
                </svg>
              </div>
              <h3
                class="text-white text-lg md:text-xl font-black leading-[120%] mb-1"
              >
                Yuma
              </h3>
              <p
                class="text-primary-400 text-sm md:text-base font-medium leading-[150%]"
              >
                課程安排很彈性,教練會根據我的進度調整訓練
              </p>
            </div>
          </li>

          <li
            class="w-full lg:w-[416px] min-h-[152px] flex gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-primary-600"
          >
            <img
              src="/avatar-03.png"
              alt="Herry"
              class="w-20 h-20 md:w-[104px] md:h-[104px] object-cover rounded shrink-0"
            />
            <div class="flex flex-col flex-1">
              <div class="flex mb-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L15.09 8.82L22.24 9.51L16.62 14.48L18.18 21.52L12 17.86L5.82 21.52L7.38 14.48L1.76 9.51L8.91 8.82L12 2Z"
                    fill="#F36A0E"
                  />
                </svg>
              </div>
              <h3
                class="text-white text-lg md:text-xl font-black leading-[120%] mb-1"
              >
                Herry
              </h3>
              <p
                class="text-primary-400 text-sm md:text-base font-medium leading-[150%]"
              >
                教練很有耐心且專業,讓我在訓練中充滿動力
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="py-20 bg-primary-900">
      <div class="mx-auto">
        <div class="text-center mb-8 md:mb-10 lg:mb-12">
          <p
            class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-1"
          >
            COACH TEAM
          </p>
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] text-center mb-3 md:mb-4"
          >
            <span class="text-primary-0">我們的</span>
            <span class="text-secondary-800">團隊</span>
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            專業的健身教練，助你達成目標
          </p>
        </div>

        <div class="overflow-x-hidden">
          <ul class="flex animate-scroll">
            <li
              v-for="(coach, index) in displayCoaches"
              :key="`${coach.id}-${index}`"
              :class="[
                'relative w-[373px] h-[479px] flex-shrink-0',
                { 'mt-12': index % 2 === 1 },
              ]"
            >
              <div
                class="absolute top-[20px] left-[12px] w-[373px] h-[459px] bg-secondary-800 [clip-path:polygon(65px_0,100%_0,calc(100%-65px)_100%,0_100%)]"
              ></div>
              <div class="relative z-10 w-[373px] h-[459px]">
                <img
                  :src="coach.image"
                  :alt="coach.name"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute bottom-[21px] left-[19px] px-[10px] py-[5px] flex items-center justify-center backdrop-blur-sm"
                  style="
                    background: radial-gradient(
                      62.87% 75.99% at 48.9% 50%,
                      rgba(197, 197, 197, 0.5) 0%,
                      rgba(255, 255, 255, 0) 100%
                    );
                  "
                >
                  <span
                    class="text-xl font-black leading-[120%] text-center text-secondary-800"
                  >
                    {{ coach.name }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="mt-12 text-center">
          <p
            class="text-xl font-black leading-[120%] text-center text-primary-0 mb-4"
          >
            前往觀看你有興趣的教練
          </p>
          <button
            @click="$router.push('/coaches')"
            class="w-[104px] h-12 px-5 py-3 rounded bg-secondary-800 text-base font-medium leading-[150%] text-center text-primary-900"
          >
            前往了解
          </button>
        </div>
      </div>
    </section>

    <section class="py-20 bg-primary-800">
      <div class="max-w-7xl mx-auto px-4 md:px-8 2xl:px-0">
        <div class="text-center mb-8 md:mb-10 lg:mb-12">
          <p
            class="text-sm md:text-base font-bold leading-[120%] text-primary-400 mb-1"
          >
            COURSE PLAN
          </p>
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] text-center mb-3 md:mb-4"
          >
            <span class="text-primary-0">選擇適合</span>
            <span class="text-secondary-800">你的方案</span>
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto px-4 md:px-0"
          >
            我們提供多種課程方案以滿足需求
          </p>
        </div>

        <ul
          class="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-4 xl:gap-6"
        >
          <li
            class="w-full max-w-[306px] h-[352px] px-6 py-8 flex flex-col rounded-lg border border-primary-0 order-2 lg:order-1"
          >
            <h3 class="text-xl font-black leading-[120%] text-primary-0 mb-2">
              輕便方案
            </h3>

            <div class="mb-6 pb-6 border-b border-white">
              <span
                class="text-[40px] font-black leading-[120%] text-secondary-800"
                >NT$ 1,400</span
              >
              <span class="text-base font-bold leading-[120%] text-primary-300">
                / 起</span
              >
            </div>

            <ul class="flex flex-col gap-2 mb-6 flex-grow">
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >包含 7 堂課</span
                >
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >每堂 50 分鐘</span
                >
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >輕便方案，適合體驗</span
                >
              </li>
            </ul>

            <router-link
              to="/fitness-plans"
              class="w-full h-12 px-5 py-3 rounded border border-primary-300 text-base font-medium leading-[150%] text-center text-primary-300 inline-flex items-center justify-center"
            >
              手刀購買
            </router-link>
          </li>

          <li
            class="w-full max-w-[306px] h-[403px] px-6 py-8 flex flex-col rounded-lg border-4 border-secondary-800 order-1 lg:order-2"
          >
            <div
              class="inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-[20px] bg-secondary-800 mb-6"
            >
              <span
                class="text-xs font-medium leading-[150%] tracking-[0.02em] text-primary-0 whitespace-nowrap"
              >
                最受歡迎
              </span>
            </div>

            <h3 class="text-xl font-black leading-[120%] text-primary-0 mb-2">
              超值方案
            </h3>

            <div class="mb-6 pb-6 border-b border-white">
              <span
                class="text-[40px] font-black leading-[120%] text-secondary-800"
                >NT$ 2,520</span
              >
              <span class="text-base font-bold leading-[120%] text-primary-300">
                / 起</span
              >
            </div>

            <ul class="flex flex-col gap-2 mb-6 flex-grow">
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >包含 21 堂課</span
                >
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >每堂 50 分鐘</span
                >
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >贈送飲食評估一次</span
                >
              </li>
            </ul>

            <router-link
              to="/fitness-plans"
              class="w-full h-12 px-5 py-3 rounded bg-secondary-800 text-base font-medium leading-[150%] text-center text-primary-900 inline-flex items-center justify-center"
            >
              手刀購買
            </router-link>
          </li>

          <li
            class="w-full max-w-[306px] h-[352px] px-6 py-8 flex flex-col rounded-lg border border-primary-0 order-3 lg:order-3"
          >
            <h3 class="text-xl font-black leading-[120%] text-primary-0 mb-2">
              豪華方案
            </h3>

            <div class="mb-6 pb-6 border-b border-white">
              <span
                class="text-[40px] font-black leading-[120%] text-secondary-800"
                >NT$ 4,800</span
              >
              <span class="text-base font-bold leading-[120%] text-primary-300">
                / 起</span
              >
            </div>

            <ul class="flex flex-col gap-2 mb-6 flex-grow">
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >包含 48 堂課</span
                >
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >每堂 50 分鐘</span
                >
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 16L18 8"
                    stroke="#F36A0E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span
                  class="text-base font-normal leading-[150%] text-primary-0"
                  >專屬訓練計畫與營養指導</span
                >
              </li>
            </ul>

            <router-link
              to="/fitness-plans"
              class="w-full h-12 px-5 py-3 rounded border border-primary-300 text-base font-medium leading-[150%] text-center text-primary-300 inline-flex items-center justify-center"
            >
              手刀購買
            </router-link>
          </li>
        </ul>
      </div>
    </section>

    <section class="relative py-12 md:py-16 lg:py-20 overflow-hidden flex items-center justify-center">
      <img
        src="/gym.png"
        alt="Gym Background"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="relative z-10 mx-4 md:mx-8 w-full max-w-[1296px] min-h-[300px] md:min-h-[350px] lg:min-h-[403px] flex items-center justify-center px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20" style="background: #F3690E33;">
        <div class="text-center w-full">
          <h2
            class="text-[28px] md:text-[32px] lg:text-[40px] font-black leading-[120%] text-center text-primary-0 mb-4"
          >
            立即註冊，開始健身之旅
          </h2>
          <p
            class="text-sm md:text-base font-normal leading-[150%] text-primary-300 mx-auto mb-6 px-4 md:px-0"
          >
            加入我們，獲取專業的健身指導和個性化的課程安排，讓您的健身更有效！
          </p>

          <div class="flex flex-row justify-center items-center gap-12 sm:gap-6">
            <a
              href="tel:+88622298332"
              class="w-[104px] h-12 px-5 py-3 rounded border border-primary-300 text-sm md:text-base font-medium leading-[150%] text-primary-300 text-center inline-flex items-center justify-center whitespace-nowrap"
            >
              聯絡客服
            </a>
            <router-link
              to="/signup"
              class="w-[104px] h-12 px-5 py-3 rounded bg-secondary-800 text-sm md:text-base font-medium leading-[150%] text-primary-900 text-center inline-flex items-center justify-center whitespace-nowrap"
            >
              立即註冊
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";

const coaches = [
  { id: 1, name: "Jack", image: "/people-08.png" },
  { id: 2, name: "Lisa", image: "/people-09.png" },
  { id: 3, name: "Mike", image: "/people-10.png" },
  { id: 4, name: "Ken", image: "/people-11.png" },
  { id: 5, name: "Willen", image: "/people-12.png" },
  { id: 6, name: "Amy", image: "/people-13.png" },
];

const displayCoaches = computed(() => {
  return [...coaches, ...coaches, ...coaches, ...coaches];
});
</script>

<style scoped>
@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-373px * 6));
  }
}

.animate-scroll {
  animation: scroll 40s linear infinite;
}
</style>
