import { addDays } from 'date-fns'

export function getNextDeliveryDate(
  frequency: 'weekly' | 'monthly',
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const today = new Date()
  let date = addDays(today, 1)

  if (frequency === 'weekly' && dayOfWeek !== undefined) {
    while (date.getDay() !== dayOfWeek) {
      date = addDays(date, 1)
    }
  }

  if (frequency === 'monthly' && dayOfMonth !== undefined) {
    const d = Math.min(dayOfMonth, 28)
    date = new Date(today.getFullYear(), today.getMonth(), d)
    if (date <= today) {
      date = new Date(today.getFullYear(), today.getMonth() + 1, d)
    }
  }

  return date
}
