"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import styles from "./contact.module.css";

const ContactPage = () => {
  const container = useRef();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => {
      gsap.to(`.${styles.contactHeading} h1`, {
        y: 0,
        duration: 1.2,
        delay: 0.8,
        ease: "power4.out",
      });

      gsap.to(
        [`.${styles.sectionLabel} p`, `.${styles.item} p`, `.${styles.item} a`],
        {
          y: 0,
          duration: 1,
          delay: 1,
          stagger: 0.07,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        `.${styles.formSection}`,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: "power3.out" }
      );
    },
    { scope: container }
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Message sent! We'll get back to you soon.");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.contactPage} website-gutter`} ref={container}>

      {/* ── Info section ── */}
      <div className={styles.infoSection}>
        <div className={styles.container}>

          {/* Left column */}
          <div className={styles.col}>
            <div>
              <div className={styles.sectionLabel}><p>Where</p></div>
              <div className={styles.divider} />
              <div className={styles.item}><p>MomStitched</p></div>
              <div className={styles.item}><p>Market, Lucknow</p></div>
              <div className={styles.item}><p>India — 256320</p></div>
            </div>

            <div>
              <div className={styles.sectionLabel}><p>Phone</p></div>
              <div className={styles.divider} />
              <div className={styles.item}>
                <a href="tel:+918569874589">+91 85698 74589</a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className={styles.col}>
            <div className={styles.contactHeading}>
              <h1 className="font-header">Contact</h1>
            </div>

            <div>
              <div className={styles.sectionLabel}><p>Socials</p></div>
              <div className={styles.divider} />
              <div className={styles.item}>
                <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              </div>
              <div className={styles.item}>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
              </div>
              <div className={styles.item}>
                <a href="https://youtube.com" target="_blank" rel="noreferrer">YouTube</a>
              </div>
            </div>

            <div>
              <div className={styles.sectionLabel}><p>Mail</p></div>
              <div className={styles.divider} />
              <div className={styles.item}>
                <a href="mailto:momstitched.official@gmail.com">momstitched.official@gmail.com</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Form section ── */}
      <div className={styles.formSection}>
        <div className={styles.formInner}>

          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>Send a message</p>
            <div className={styles.divider} />
          </div>

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject" className={styles.label}>Subject <span className={styles.optional}>(optional)</span></label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What's this about?"
                value={form.subject}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                className={`${styles.input} ${styles.textarea}`}
              />
            </div>

            <div className={styles.formFooter}>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};

export default ContactPage;
