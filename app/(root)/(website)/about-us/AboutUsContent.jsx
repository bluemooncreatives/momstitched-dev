"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomEase from "gsap/CustomEase";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "@/lib/SplitType/index";
import styles from "./about-us.module.css";
import { cvItems } from "./cvItems";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, ScrollTrigger);
  CustomEase.create(
    "hop",
    "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
  );
}

const AboutUsContent = () => {
  const container = useRef();
  const aboutCopyRef = useRef(null);
  const cvWrapperRef = useRef(null);
  const cvHeaderRef = useRef(null);
  const cvListRef = useRef(null);
  const heroImgRef = useRef(null);

  useEffect(() => {
    const splitInstances = [];
    const pageTriggers = [];

    const applySplitType = (element) => {
      const splitTexts = element.querySelectorAll("h1, h2, h3");

      splitTexts.forEach((text) => {
        const split = new SplitType(text, {
          types: "lines",
          tagName: "span",
        });

        splitInstances.push(split);

        split.lines.forEach((line) => {
          const wrapper = document.createElement("div");
          wrapper.className = styles.lineWrapper;
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });
      });
    };

    if (aboutCopyRef.current) {
      applySplitType(aboutCopyRef.current);

      gsap.to(
        aboutCopyRef.current.querySelectorAll(`.${styles.lineWrapper} > span`),
        {
          y: 0,
          stagger: 0.05,
          delay: 1.5,
          duration: 1.5,
          ease: "power4.out",
        }
      );
    }

    if (cvHeaderRef.current) {
      applySplitType(cvHeaderRef.current);
    }

    if (cvListRef.current) {
      applySplitType(cvListRef.current);
    }

    if (cvWrapperRef.current) {
      const cvHeaderSpans = cvHeaderRef.current.querySelectorAll(
        `.${styles.lineWrapper} > span`
      );
      const cvListSpans = cvListRef.current.querySelectorAll(
        `.${styles.lineWrapper} > span`
      );

      gsap.set([cvHeaderSpans, cvListSpans], { y: "100%" });

      const cvTrigger = ScrollTrigger.create({
        trigger: cvWrapperRef.current,
        start: "top 50%",
        onEnter: () => {
          gsap.to(cvHeaderSpans, {
            y: 0,
            stagger: 0.05,
            duration: 1.5,
            ease: "power4.out",
          });

          gsap.to(cvListSpans, {
            y: 0,
            stagger: 0.02,
            duration: 1.5,
            ease: "power4.out",
          });
        },
      });

      pageTriggers.push(cvTrigger);
    }

    if (heroImgRef.current) {
      const heroImg = heroImgRef.current.querySelector("img");
      if (heroImg) {
        const heroTween = gsap.fromTo(
          heroImg,
          { scale: 1 },
          {
            scale: 1.5,
            ease: "none",
            scrollTrigger: {
              trigger: heroImgRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
        if (heroTween.scrollTrigger) {
          pageTriggers.push(heroTween.scrollTrigger);
        }
      }
    }

    return () => {
      splitInstances.forEach((split) => split.revert());
      pageTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  useGSAP(
    () => {
      gsap.to(`.${styles.aboutPortrait}`, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        delay: 0.8,
        duration: 1,
        ease: "hop",
      });

      gsap.to(`.${styles.aboutCopyTitle} h1`, {
        y: 0,
        delay: 1,
        duration: 1.5,
        ease: "power4.out",
      });
    },
    { scope: container }
  );

  return (
    <div className={styles.aboutPage} ref={container}>
      <div className={styles.container}>
        <div className={styles.aboutIntro}>
          <div className={styles.aboutPortraitImg}>
            <div className={styles.aboutPortrait}>
              <Image
                src="/about/portrait-min.jpg"
                alt="Portrait"
                width={960}
                height={1280}
                priority
                sizes="(max-width: 900px) 100vw, 40vw"
                className={styles.portraitImage}
              />
            </div>
          </div>

          <div className={styles.aboutCopyWrapper}>
            <div className={styles.aboutCopyTitle}>
              <h1>About Us</h1>
            </div>

            <div className={styles.aboutCopy} ref={aboutCopyRef}>
              <h3>
                Passionate about crafting immersive digital experiences, Stefan
                Markovic blends design and code to push the boundaries of
                what&apos;s possible on the web. His approach focuses on creating
                seamless, responsive, and engaging interfaces that leave a
                lasting impact.
              </h3>
              <br />
              <h3>
                With a strong foundation in JavaScript, React, and modern web
                technologies, Stefan excels at turning complex ideas into
                interactive realities. Whether it&apos;s a sleek portfolio site, a
                dynamic web app, or a mesmerizing animation, he approaches each
                project with creativity and technical precision.
              </h3>
              <br />
              <h3>
                Driven by curiosity and innovation, Stefan constantly explores
                new tools, techniques, and frameworks. He&apos;s not just a
                developer - he&apos;s a problem solver, ready to bring your vision
                to
                life with a unique and modern touch.
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.aboutHeroImg} ref={heroImgRef}>
        <Image
          src="/about/portrait-2-min.jpg"
          alt="Portrait"
          fill
          sizes="100vw"
          className={styles.heroImage}
        />
      </div>

      <div className={styles.container}>
        <div className={styles.cvWrapper} ref={cvWrapperRef}>
          <div className={styles.cvHeader} ref={cvHeaderRef}>
            <h2>CV</h2>
          </div>

          <div ref={cvListRef}>
            {cvItems.map((item, index) => (
              <div className={styles.cvItem} key={index}>
                <div className={styles.cvName}>
                  <h3>{item.name}</h3>
                </div>
                <div className={styles.cvYear}>
                  <h3>{item.year}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsContent;
