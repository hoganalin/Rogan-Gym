import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * 首頁專用的平滑捲動。**只掛在公開頁**，不要掛在 /user 或 /coach 的 route
 * ——課表週曆與後台表單在接手捲動下操作手感會變差。
 *
 * 需要的 DOM 結構（只在有掛這個 hook 的頁面）：
 *   <div id="smooth-wrapper">
 *     <div id="smooth-content">  …頁面內容…  </div>
 *   </div>
 *
 * 並在全域 CSS 加上：
 *   #smooth-wrapper { overflow: hidden; }
 */
export function useSmoothScroll(enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0.9,
      effects: true, // 啟用 data-speed / data-lag
      normalizeScroll: true,
    });

    return () => smoother.kill();
  }, [enabled]);
}
