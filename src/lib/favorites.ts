"use client";

/**
 * Sevimli e'tirozlar — localStorage'da saqlanadi (auth keshi bilan bir xil
 * yondashuv; real Supabase ulanmaguncha sinxron, ishonchli saqlash qatlami).
 * closeme "Избранное" ga o'xshash, lekin bizda hozircha lokal.
 */

const KEY = "sotibkor_fav_objections";

export function getFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr)
      ? new Set(arr.filter((x) => typeof x === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

export function saveFavorites(favs: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(favs)));
  } catch {
    /* localStorage yo'q — e'tiborsiz */
  }
}

/** Bitta e'tirozni sevimlilarga qo'shadi/olib tashlaydi, yangi to'plamni qaytaradi. */
export function toggleFavorite(id: string): Set<string> {
  const favs = getFavorites();
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  saveFavorites(favs);
  return favs;
}
