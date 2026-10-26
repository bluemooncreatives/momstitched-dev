"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomEase from "gsap/CustomEase";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "@/lib/SplitType/index";
import ShopAllButton from "@/components/Application/Website/ShopAllButton";
import ProductBox from "@/components/Application/Website/ProductBox";
import { DEFAULT_ABOUT_PAGE } from "@/lib/pageContent/aboutPage";
import { paragraphs } from "@/lib/pageContent/shared";
import { initialsOf } from "@/lib/utils";
import styles from "./about-us.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, ScrollTrigger);
  if (!CustomEase.get("hop")) {
    CustomEase.create(
      "hop",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
    );
  }
}

// The copy and photos come from Admin → Pages → About Us (merged over the
// designed defaults in lib/pageContent/aboutPage.js).

// A photo slot that may be empty; empty slots are left out of the page.
const hasPhoto = (img) => Boolean(img?.url);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AboutUsContent = ({ content = DEFAULT_ABOUT_PAGE, products = [] }) => {
  const { hero, story, feature, family, related } = content;
  const storyParagraphs = paragraphs(story.body);
  const captionLines = hero.caption.split("\n").map((line) => line.trim()).filter(Boolean);
  const container = useRef(null);
  const headlineRef = useRef(null);
  const statementRef = useRef(null);
  const supportRef = useRef(null);
  const peopleRef = useRef(null);
  const scrollImgRef = useRef(null);
  const heroRef = useRef(null);
  const flankLeftRef = useRef(null);
  const flankRightRef = useRef(null);
  const centerImgRef = useRef(null);

  // ── SplitType line reveals + scroll-scrub image ──────────────────
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const splitInstances = [];
    const triggers = [];
    const tweens = [];
    let cancelled = false;

    // Wrap each split line in an overflow-hidden mask so the slide-up reads
    // as a clean "popup from bottom" reveal.
    const splitToMaskedLines = (root) => {
      const targets = root.querySelectorAll("h1, h2, h3, p");
      const spans = [];
      targets.forEach((el) => {
        const split = new SplitType(el, { types: "lines", tagName: "span" });
        splitInstances.push(split);
        split.lines.forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.className = styles.lineWrapper;
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
          spans.push(line);
        });
      });
      return spans;
    };

    const run = () => {
      if (cancelled || !container.current) return;

      // Statement + supporting copy: reveal when scrolled into view.
      [statementRef.current, supportRef.current].forEach((root) => {
        if (!root) return;
        const spans = splitToMaskedLines(root);
        if (reduced) {
          gsap.set(spans, { y: 0 });
          return;
        }
        gsap.set(spans, { y: "115%" });
        const t = ScrollTrigger.create({
          trigger: root,
          start: "top 82%",
          once: true,
          onEnter: () =>
            tweens.push(
              gsap.to(spans, {
                y: 0,
                stagger: 0.05,
                duration: 1.2,
                ease: "power4.out",
              })
            ),
        });
        triggers.push(t);
      });

      // Profile blocks: editorial reveal — the image clips up from the bottom
      // while its photo settles from a soft zoom, and the text lines stagger in.
      // Each photo also gets a gentle scroll-scrub Ken-Burns drift for depth.
      if (peopleRef.current) {
        const profiles = peopleRef.current.querySelectorAll(`.${styles.profile}`);
        profiles.forEach((profile) => {
          const imgWrap = profile.querySelector(`.${styles.profileImg}`);
          const photo = imgWrap?.querySelector("img");
          const textEls = profile.querySelectorAll(`.${styles.profileBody} > *`);

          if (reduced) {
            if (imgWrap) gsap.set(imgWrap, { clipPath: "none" });
            if (photo) gsap.set(photo, { scale: 1 });
            gsap.set(textEls, { autoAlpha: 1, y: 0 });
            return;
          }

          // Initial hidden states
          if (imgWrap)
            gsap.set(imgWrap, { clipPath: "inset(100% 0% 0% 0% round 6px)" });
          if (photo) gsap.set(photo, { scale: 1.3 });
          gsap.set(textEls, { autoAlpha: 0, y: 28 });

          const tl = gsap.timeline({
            scrollTrigger: { trigger: profile, start: "top 75%", once: true },
          });
          if (imgWrap)
            tl.to(
              imgWrap,
              {
                clipPath: "inset(0% 0% 0% 0% round 6px)",
                duration: 1.1,
                ease: "power4.out",
              },
              0
            );
          if (photo)
            tl.to(photo, { scale: 1.04, duration: 1.3, ease: "power3.out" }, 0);
          tl.to(
            textEls,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.08,
            },
            0.25
          );

          tweens.push(tl);
          if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);

          // Ongoing Ken-Burns drift (scale 1.04 baseline gives headroom so no edge gap)
          if (photo) {
            const kb = gsap.fromTo(
              photo,
              { yPercent: -2.5 },
              {
                yPercent: 2.5,
                ease: "none",
                scrollTrigger: {
                  trigger: profile,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
            tweens.push(kb);
            if (kb.scrollTrigger) triggers.push(kb.scrollTrigger);
          }
        });
      }

      // Hero images: layered parallax — each moves at a different rate as the
      // page scrolls, giving depth. Side thumbs drift the most, center least.
      if (heroRef.current && !reduced) {
        const parallax = [
          { el: flankLeftRef.current, y: -180 },
          { el: flankRightRef.current, y: -260 },
          { el: centerImgRef.current, y: -90 },
        ];
        parallax.forEach(({ el, y }) => {
          if (!el) return;
          const tween = gsap.fromTo(
            el,
            { yPercent: 0 },
            {
              y,
              ease: "none",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            }
          );
          tweens.push(tween);
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        });
      }

      // Middle image: scrub-scale on scroll (skipped under reduced motion).
      if (scrollImgRef.current && !reduced) {
        const tween = gsap.fromTo(
          scrollImgRef.current,
          { scale: 1 },
          {
            scale: 1.4,
            ease: "none",
            scrollTrigger: {
              trigger: scrollImgRef.current.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        tweens.push(tween);
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

      // Recompute trigger positions once everything is laid out.
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };

    // Split only after fonts are ready so line breaks (and therefore the
    // masks) match the rendered text instead of the fallback font.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(run);

    // A late refresh covers async image loads shifting layout.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      tweens.forEach((t) => t.kill());
      triggers.forEach((t) => t.kill());
      splitInstances.forEach((s) => s.revert());
    };
  }, []);

  // ── Intro reveal: headline slides up after mount ─────────────────
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(headlineRef.current, { y: 0 });
        return;
      }
      gsap.to(headlineRef.current, {
        y: 0,
        delay: 0.35,
        duration: 1.3,
        ease: "hop",
      });
    },
    { scope: container }
  );

  return (
    <div className={styles.page} ref={container}>
      <div className={styles.inner}>
        {/* Hero: centered image, flanking thumbs, giant headline */}
        <div className={styles.hero} ref={heroRef}>
          {hasPhoto(hero.left) && (
            <div className={`${styles.flankImage} ${styles.flankLeft}`} ref={flankLeftRef}>
              <Image
                src={hero.left.url}
                alt={hero.left.alt}
                fill
                sizes="130px"
                className="object-cover"
                style={{ objectPosition: hero.left.position }}
              />
            </div>
          )}
          {hasPhoto(hero.right) && (
            <div className={`${styles.flankImage} ${styles.flankRight}`} ref={flankRightRef}>
              <Image
                src={hero.right.url}
                alt={hero.right.alt}
                fill
                sizes="110px"
                className="object-cover"
                style={{ objectPosition: hero.right.position }}
              />
            </div>
          )}

          {hasPhoto(hero.centre) && (
            <div className={styles.centerImage} ref={centerImgRef}>
              <Image
                src={hero.centre.url}
                alt={hero.centre.alt}
                fill
                priority
                sizes="(max-width: 900px) 70vw, 360px"
                className="object-cover"
                style={{ objectPosition: hero.centre.position }}
              />
            </div>
          )}

          <div className={styles.headlineMask}>
            <h1 className={styles.headline} ref={headlineRef}>
              {hero.headline}
            </h1>
          </div>
        </div>

        {/* Plus marker + caption */}
        <div className={styles.marker}>
          <span className={styles.plus}>+</span>
          <span className={styles.rule} />
          <span className={styles.caption}>
            {captionLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </span>
        </div>

        {/* Big statement + brand story */}
        {story.enabled && (
          <div className={styles.statementWrap}>
            <div ref={statementRef}>
              <h2 className={styles.statement}>{story.statement}</h2>
            </div>
            {storyParagraphs.length > 0 && (
              <div className={styles.story} ref={supportRef}>
                {storyParagraphs.map((para, i) => (
                  <p className={styles.storyText} key={i}>
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-width scroll-scaled middle image */}
      {feature.enabled && hasPhoto(feature.image) && (
        <div className={styles.scrollImageWrap}>
          <img
            ref={scrollImgRef}
            src={feature.image.url}
            alt={feature.image.alt}
            className={styles.scrollImage}
            style={{ objectPosition: feature.image.position }}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {family.enabled && (
        <div className={styles.inner}>
          {/* The family behind the brand */}
          <div className={styles.people} ref={peopleRef}>
            <div className={styles.peopleHead}>
              {family.eyebrow && <span className={styles.peopleEyebrow}>{family.eyebrow}</span>}
              <h2 className={styles.peopleHeadline}>{family.title}</h2>
              {family.intro && <p className={styles.peopleIntro}>{family.intro}</p>}
            </div>

            {/* Profiles alternate photo left / right. */}
            {family.people.map((person, index) => (
              <article
                key={`${person.name}-${index}`}
                className={`${styles.profile} ${
                  index % 2 === 1 ? styles.profileReverse : ""
                }`}
              >
                <div className={styles.profileImg}>
                  {hasPhoto(person.photo) ? (
                    <Image
                      src={person.photo.url}
                      alt={person.photo.alt || person.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover"
                      style={{ objectPosition: person.photo.position }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="grid size-full place-items-center font-neue text-[clamp(3rem,8vw,6rem)] text-[var(--dark-red)]/40"
                    >
                      {initialsOf(person.name)}
                    </span>
                  )}
                </div>
                <div className={styles.profileBody}>
                  {person.role && <span className={styles.profileRole}>{person.role}</span>}
                  <h3 className={styles.profileName}>{person.name}</h3>
                  {paragraphs(person.bio).map((para, i) => (
                    <p className={styles.profileBio} key={i}>
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            {/* CTA — shared website button for consistent styling */}
            {family.ctaLabel && (
              <div className={styles.ctaWrap}>
                <ShopAllButton
                  label={family.ctaLabel}
                  href={family.ctaHref || "/contact"}
                  colorScheme="dark-red"
                  radius="sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Curated For You · You May Also Like (centered) ───────────── */}
      {related.enabled && products.length > 0 && (
        <div className={styles.inner}>
          <section className={styles.related}>
            <div className="mb-8 text-center lg:mb-10">
              {related.eyebrow && (
                <p className="text-[1rem] font-semibold uppercase text-[var(--dark-red)]/60">
                  {related.eyebrow}
                </p>
              )}
              <h2 className="mt-1.5 font-neue text-[clamp(1.6rem,3.4vw,2.6rem)] font-medium uppercase leading-[1.1] text-[var(--dark-red-2)]">
                {related.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((item) => (
                <ProductBox key={item._id} product={item} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AboutUsContent;
