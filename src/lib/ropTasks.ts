"use client";

/**
 * ROP tayinlagan vazifalar — ROP (jamoa rahbari) jamoa a'zolariga topshiriq
 * beradi; menejer /vazifalar'da o'ziga tayinlanganlarni ko'radi. localStorage'da
 * saqlanadi (jonli, real Supabase ulanmaguncha lokal — auth keshi bilan bir xil).
 */

import type { ObjectionType } from "./coach";

export interface RopAssignment {
  id: string;
  member: string; // jamoa a'zosi (menejer) ismi
  title: string;
  focus: ObjectionType;
  target: number;
  createdAt: string; // ISO
}

const KEY = "sotibkor_rop_assignments";

export function getRopAssignments(): RopAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? (arr as RopAssignment[]) : [];
  } catch {
    return [];
  }
}

function save(list: RopAssignment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* e'tiborsiz */
  }
}

export interface AssignInput {
  member: string;
  title: string;
  focus: ObjectionType;
  target: number;
  atIso: string;
}

/** Yangi topshiriq qo'shadi (eng yangisi birinchi), yangilangan ro'yxatni qaytaradi. */
export function assignRopTask(input: AssignInput): RopAssignment[] {
  const entry: RopAssignment = {
    id: `${input.atIso}-${input.member}-${input.title.length}`,
    member: input.member,
    title: input.title.trim(),
    focus: input.focus,
    target: Math.max(1, Math.floor(input.target) || 1),
    createdAt: input.atIso,
  };
  const next = [entry, ...getRopAssignments()];
  save(next);
  return next;
}

/** Topshiriqni o'chiradi, yangilangan ro'yxatni qaytaradi. */
export function removeRopAssignment(id: string): RopAssignment[] {
  const next = getRopAssignments().filter((a) => a.id !== id);
  save(next);
  return next;
}

/** Berilgan a'zoga (ism bo'yicha, katta-kichik harfsiz) tayinlangan topshiriqlar. */
export function assignmentsForMember(name: string): RopAssignment[] {
  const n = name.trim().toLowerCase();
  return getRopAssignments().filter((a) => a.member.trim().toLowerCase() === n);
}
