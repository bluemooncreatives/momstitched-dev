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
