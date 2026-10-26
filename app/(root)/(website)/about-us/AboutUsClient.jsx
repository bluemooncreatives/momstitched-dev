"use client";

import dynamic from "next/dynamic";

const AboutUsContent = dynamic(() => import("./AboutUsContent"), {
  ssr: false,
});

export default function AboutUsClient({ content, products = [] }) {
  return <AboutUsContent content={content} products={products} />;
}
