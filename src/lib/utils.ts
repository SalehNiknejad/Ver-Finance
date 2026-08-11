import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

const persianNumber = new Intl.NumberFormat('fa-IR')
const persianCurrency = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })
const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' })
const shortPersianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' })

export const formatNumber = (value: number, maximumFractionDigits = 0): string =>
  new Intl.NumberFormat('fa-IR', { maximumFractionDigits }).format(value)

export const formatToman = (value: number): string => `${persianCurrency.format(Math.round(value))} تومان`
export const formatDate = (value: string | Date): string => persianDate.format(new Date(value))
export const formatShortDate = (value: string | Date): string => shortPersianDate.format(new Date(value))
export const toPersianDigits = (value: string | number): string => String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit)
export const formatCount = (value: number): string => persianNumber.format(value)
export const todayIso = (): string => new Date().toISOString().slice(0, 10)

export function isSameMonth(isoDate: string, reference = new Date()): boolean {
  const date = new Date(isoDate)
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

export function parseAmount(value: string): number {
  const normalized = value.replace(/[٬,\s]/g, '').replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
  return Number(normalized)
}

export function getNextDueDate(plan: { start_date: string; paid_installments: number; due_day: number }): Date {
  const start = new Date(`${plan.start_date}T12:00:00`)
  const due = new Date(start.getFullYear(), start.getMonth() + plan.paid_installments, 1, 12)
  const lastDay = new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate()
  due.setDate(Math.min(plan.due_day, lastDay))
  return due
}

export function createId(): string {
  return crypto.randomUUID()
}
