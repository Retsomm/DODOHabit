import {
  format,
  subDays,
  eachDayOfInterval,
  parseISO,
  getDay,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'

export const todayStr = (): string => format(new Date(), 'yyyy-MM-dd')

export const formatDisplay = (dateStr: string): string =>
  format(parseISO(dateStr), 'M月d日 EEEE', { locale: zhTW })

export const formatShort = (dateStr: string): string =>
  format(parseISO(dateStr), 'M/d')

export const formatMonth = (dateStr: string): string =>
  format(parseISO(dateStr), 'M月', { locale: zhTW })

export const getLast364Days = (): string[] => {
  const end = new Date()
  const start = subDays(end, 363)
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
}

export const getLast30Days = (): string[] => {
  const end = new Date()
  const start = subDays(end, 29)
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
}

export const getDayOfWeek = (dateStr: string): number => getDay(parseISO(dateStr))
