const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

function getTodayKey(): string {
  const day = new Date().getDay()
  return DAYS[day === 0 ? 6 : day - 1]
}

function isOpenNow(hours: Record<string, string>): boolean {
  const todayKey = getTodayKey()
  const todayHours = hours[todayKey]
  if (!todayHours || todayHours === 'Closed') return false

  const match = todayHours.match(/^(\d{2}):(\d{2})[\u2013\-](\d{2}):(\d{2})$/)
  if (!match) return false

  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = parseInt(match[1]) * 60 + parseInt(match[2])
  const closeMinutes = parseInt(match[3]) * 60 + parseInt(match[4])
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes
}

interface OpeningHoursProps {
  hours: Record<string, string>
}

export function OpeningHours({ hours }: OpeningHoursProps) {
  const todayKey = getTodayKey()
  const open = isOpenNow(hours)

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${
            open
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${open ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {open ? 'Open now' : 'Closed now'}
        </span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {DAYS.map((day) => (
            <tr
              key={day}
              className={`${day === todayKey ? 'font-semibold text-stone-900' : 'text-stone-600'}`}
            >
              <td className="py-1 pr-4 w-32">{DAY_LABELS[day]}</td>
              <td className="py-1">{hours[day] ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
