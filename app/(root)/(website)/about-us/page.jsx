import AboutUsClient from "./AboutUsClient";
import { getBestsellerProducts } from "@/lib/services/productService";
import { pickRandom } from "@/lib/utils";
import { getAboutPageContent } from "@/lib/services/pageContentService";

// Re-render per request so the random picks vary on each visit (the bestseller
// pool itself stays cached inside getBestsellerProducts).
export const dynamic = "force-dynamic";

export default async function AboutUsPage() {
  // Copy and photos are edited in Admin → Pages → About Us.
  const content = await getAboutPageContent();
  // "You May Also Like" — 4 random picks from the storefront bestseller pool.
  const products = content.related.enabled ? await getBestsellerProducts() : [];
  return <AboutUsClient content={content} products={pickRandom(products ?? [], 4)} />;
}
