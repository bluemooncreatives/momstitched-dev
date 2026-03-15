"use client";

import { SunIcon as Sunburst } from "lucide-react";
import { useState } from "react";

export const FullScreenSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value) => {
    return value.length >= 8;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    setSubmitted(true);

    if (valid) {
      // Submission logic goes here
      console.log("Form submitted!");
      console.log("Email:", email);
      alert("Form submitted!");
      setEmail("");
      setPassword("");
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/20 shadow-xl md:flex-row">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/55" />
        <div className="absolute z-10 flex overflow-hidden backdrop-blur-2xl">
          <div className="h-[40rem] w-[4rem] bg-[linear-gradient(90deg,#ffffff00,#000000_69%,#ffffff30)] opacity-30" />
          <div className="h-[40rem] w-[4rem] bg-[linear-gradient(90deg,#ffffff00,#000000_69%,#ffffff30)] opacity-30" />
          <div className="h-[40rem] w-[4rem] bg-[linear-gradient(90deg,#ffffff00,#000000_69%,#ffffff30)] opacity-30" />
          <div className="h-[40rem] w-[4rem] bg-[linear-gradient(90deg,#ffffff00,#000000_69%,#ffffff30)] opacity-30" />
          <div className="h-[40rem] w-[4rem] bg-[linear-gradient(90deg,#ffffff00,#000000_69%,#ffffff30)] opacity-30" />
          <div className="h-[40rem] w-[4rem] bg-[linear-gradient(90deg,#ffffff00,#000000_69%,#ffffff30)] opacity-30" />
        </div>

        <div className="absolute bottom-0 h-[15rem] w-[15rem] rounded-full bg-orange-500" />
        <div className="absolute bottom-0 left-10 h-[5rem] w-[8rem] rounded-full bg-white" />
        <div className="absolute bottom-4 left-24 h-[4rem] w-[7rem] rounded-full bg-white/70" />

        <div
          className="relative overflow-hidden bg-black p-8 text-white md:w-1/2 md:p-12"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="relative z-10 text-2xl font-medium leading-tight tracking-tight md:text-3xl">
            Design and dev partner for startups and founders.
          </h1>
        </div>

        <div className="relative z-20 flex flex-col bg-secondary p-8 text-secondary-foreground md:w-1/2 md:p-12">
          <div className="mb-8 flex flex-col items-start">
            <div className="mb-4 text-orange-500">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-3xl font-medium tracking-tight">Get Started</h2>
            <p className="text-left opacity-80">Welcome to HextaStudio - Let&apos;s get started</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm">
                Your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="hi@hextastudio.in"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-xs text-red-500">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm">
                Create new password
              </label>
              <input
                type="password"
                id="password"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="mt-1 text-xs text-red-500">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
            >
              Create a new account
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have account?{" "}
              <a href="/login" className="font-medium text-secondary-foreground underline">
                Login
              </a>
            </div>

            {submitted && !emailError && !passwordError ? (
              <p className="text-center text-xs text-green-600">Submitted successfully.</p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
};