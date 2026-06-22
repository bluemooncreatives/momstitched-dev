import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const sortings = [
  { value: "default_sorting", label: "Default Sorting" },
  { value: "asc", label: "Name: A to Z" },
  { value: "desc", label: "Name: Z to A" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
]

export const sizes = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "2XL", value: "2XL" },
]

// Canonical form for a color label so that "Purple", "purple", "  PURPLE  "
// and "navy  blue" all collapse to a single value ("Purple" / "Navy Blue").
// Trim → collapse internal whitespace → Title Case. The result stays a valid
// CSS named color (CSS color keywords are case-insensitive) so the swatch in
// the filter sidebar keeps rendering.
export const normalizeColor = (value) => {
  if (value === undefined || value === null) return value
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Collapse a raw list of colors (from a `distinct('color')`) to unique,
// canonical, alphabetically-sorted labels. De-duplication is case-insensitive
// so legacy mixed-case data ("Emerald" + "EMERALD") shows up only once.
export const dedupeColors = (colors = []) => {
  const seen = new Map()
  for (const color of colors) {
    const normalized = normalizeColor(color)
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (!seen.has(key)) seen.set(key, normalized)
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
}

// Like dedupeColors, but each input is { name, hex }. Collapses case/whitespace
// variants to one canonical entry and keeps the first non-empty hex seen for
// that color, so the sidebar swatch can use an admin-set hex when one exists.
export const dedupeColorEntries = (entries = []) => {
  const seen = new Map()
  for (const entry of entries) {
    const normalized = normalizeColor(entry?.name)
    if (!normalized) continue
    const key = normalized.toLowerCase()
    const existing = seen.get(key)
    const hex = (entry?.hex || '').trim()
    if (!existing) {
      seen.set(key, { name: normalized, hex })
    } else if (!existing.hex && hex) {
      existing.hex = hex
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export const orderStatus = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "unverified",
]

export function getPageNumbers(currentPage, totalPages) {
  const maxVisiblePages = 5
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push("...", totalPages)
    } else if (currentPage >= totalPages - 2) {
      rangeWithDots.push("...")
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      rangeWithDots.push("...")
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push("...", totalPages)
    }
  }

  return rangeWithDots
}
