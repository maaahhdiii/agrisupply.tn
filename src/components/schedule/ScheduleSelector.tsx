import { useTranslation } from 'react-i18next'
import { getNextDeliveryDate } from '../../lib/recurring'
import type { Locale } from '../../types'

type ScheduleSelectorProps = {
  isRecurring: boolean
  frequency: 'weekly' | 'monthly'
  dayOfWeek: number
  dayOfMonth: number
  onChange: (updates: Partial<ScheduleSelectorProps>) => void
  locale: Locale
}

const ScheduleSelector = ({
  isRecurring,
  frequency,
  dayOfWeek,
  dayOfMonth,
  onChange,
  locale
}: ScheduleSelectorProps) => {
  const { t } = useTranslation()
  const isAr = locale === 'ar'

  const nextDate = getNextDeliveryDate(frequency, dayOfWeek, dayOfMonth)
  const formattedDate = new Intl.DateTimeFormat(isAr ? 'ar-TN' : 'fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(nextDate)

  const daysOfWeek = t('schedule.days', { returnObjects: true }) as string[]
  // Days of week returned are usually Sunday to Saturday.
  // In getNextDeliveryDate, 0 is Sunday.

  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onChange({ isRecurring: false })}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            !isRecurring ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('schedule.oneTime')}
        </button>
        <button
          type="button"
          onClick={() => onChange({ isRecurring: true })}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            isRecurring ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('schedule.recurring')}
        </button>
      </div>

      {isRecurring && (
        <div className="animate-slide-up space-y-6 pt-4">
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="radio"
                checked={frequency === 'weekly'}
                onChange={() => onChange({ frequency: 'weekly' })}
                className="h-4 w-4 text-primary"
              />
              {t('schedule.weekly')}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="radio"
                checked={frequency === 'monthly'}
                onChange={() => onChange({ frequency: 'monthly' })}
                className="h-4 w-4 text-primary"
              />
              {t('schedule.monthly')}
            </label>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">{t('schedule.dayOfWeek')}</p>
              <div className="flex flex-wrap gap-2">
                {/* 1=Monday to 0=Sunday logic if needed, but 0-6 works */}
                {daysOfWeek.map((dayName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({ dayOfWeek: idx })}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      dayOfWeek === idx
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">{t('schedule.dayOfMonth')}</p>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(28)].map((_, idx) => {
                  const day = idx + 1
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onChange({ dayOfMonth: day })}
                      className={`rounded-lg py-2 text-sm font-semibold transition ${
                        dayOfMonth === day
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-secondary bg-[#e7f5ea] p-4 text-primary">
            <div className="flex items-center gap-2 font-bold">
              <span>📅</span>
              <span>
                {isAr ? 'التسليم القادم: ' : 'Prochaine livraison : '}
                <span className="capitalize">{formattedDate}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScheduleSelector
