import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Options = {
  /** 方案卡高亮色，預設 brand 橘 */
  accent?: string;
  /** 卡片未高亮時的邊框色 */
  idleBorder?: string;
};

/**
 * 首頁 / 教練列表的捲動效果。
 *
 * 用法：在頁面元件最外層掛一個 ref，並在需要的元素上加 data-* 標記：
 *   data-hero            主視覺容器（position: relative）
 *   data-hero-img        主視覺背景圖
 *   data-reveal          主視覺內的文字元素（可重複）
 *   data-count           要 count-up 的數字元素（文字內容需為數字）
 *   data-rise            捲到才浮上的卡片 / 列（可重複）
 *   data-pkg-track       方案卡的 grid 容器
 *   data-pkg             每一張方案卡
 *   data-nav             導覽列外層（內含 <nav>）
 *
 * 所有效果都包在 gsap.matchMedia 的 "(prefers-reduced-motion: no-preference)"
 * 之下，使用者關閉動畫時完全不執行，元素維持最終狀態。
 */
export function useScrollFx(
  root: RefObject<HTMLElement | null>,
  { accent = "#f4501e", idleBorder = "#22242a" }: Options = {},
) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const q = <T extends Element = HTMLElement>(sel: string) =>
          Array.from(el.querySelectorAll<T>(sel));

        // ── 主視覺進場 ───────────────────────────────
        gsap.from("[data-reveal]", {
          y: 14,
          opacity: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: "power2.out",
        });

        // ── 主視覺視差：背景慢、文字快 ────────────────
        const hero = el.querySelector("[data-hero]");
        if (hero) {
          const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
          gsap.to("[data-hero-img]", { yPercent: 6, ease: "none", scrollTrigger: st });
          gsap.to("[data-reveal]", { y: -22, ease: "none", scrollTrigger: st });
        }

        // ── 數據條 count-up ─────────────────────────
        // 用 data-count-target 快取原始數值，不要每次都從 textContent 重新解析：
        // React StrictMode 在開發模式會 mount→cleanup→mount 兩次，第二次執行時
        // textContent 已經被第一次的 tween 動畫改寫過（甚至可能停在中間值），
        // 若照樣重新解析會把「動畫跑到一半的數字」誤判成目標值。
        q("[data-count]").forEach((node) => {
          const cached = node.getAttribute("data-count-target");
          const target =
            cached !== null ? parseFloat(cached) : parseFloat((node.textContent ?? "").replace(/[^\d.]/g, ""));
          if (!Number.isFinite(target)) return;
          if (cached === null) node.setAttribute("data-count-target", String(target));
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1,
            ease: "power1.out",
            scrollTrigger: { trigger: node, start: "top 88%", once: true },
            onUpdate: () => {
              node.textContent = String(Math.round(obj.v));
            },
            onComplete: () => {
              node.textContent = String(target);
            },
          });
        });

        // ── 區塊分批進場 ─────────────────────────────
        gsap.set("[data-rise]", { y: 14, opacity: 0 });
        ScrollTrigger.batch("[data-rise]", {
          interval: 0.1,
          batchMax: 6,
          start: "top 92%",
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              overwrite: true,
            }),
        });

        // ── 方案卡逐張高亮（進度驅動，不 pin） ─────────
        const track = el.querySelector("[data-pkg-track]");
        const cards = q("[data-pkg]");
        if (track && cards.length) {
          let last = -1;
          ScrollTrigger.create({
            trigger: track,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
            onUpdate: (self) => {
              const i = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
              if (i === last) return;
              last = i;
              cards.forEach((card, n) => {
                gsap.to(card, {
                  borderColor: n === i ? accent : idleBorder,
                  y: n === i ? -6 : 0,
                  duration: 0.3,
                  ease: "power2.out",
                });
              });
            },
          });
        }

        // ── 導覽列捲動收放 ───────────────────────────
        const nav = el.querySelector<HTMLElement>("[data-nav] nav");
        if (nav) {
          ScrollTrigger.create({
            start: 140,
            onUpdate: (self) => {
              const compact = self.direction === 1;
              gsap.to(nav, {
                paddingTop: compact ? 11 : 18,
                paddingBottom: compact ? 11 : 18,
                duration: 0.25,
                ease: "power2.out",
              });
            },
          });
        }

        ScrollTrigger.refresh();
      }, el);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [root, accent, idleBorder]);
}
