type BadgeProps = {
  label: string
  tone?: 'green' | 'gray' | 'orange' | 'red'
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  green: 'bg-[#e0f2e4] text-[#256b2b] border-[#b5d7bc]',
  gray: 'bg-white/80 text-slate-600 border-slate-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
}

const Badge = ({ label, tone = 'gray' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}

export default Badge
