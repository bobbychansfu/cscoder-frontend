'use client'

import { useEffect, useMemo, useState } from 'react'

type BaseAchievement = {
  id: string          
  achievementId: number 
  name: string
  description?: string
}
type EarnedAchievement = BaseAchievement & {
  earnedAt: string
}

type LockedAchievement = BaseAchievement & {
  xp: number
  xpGoal: number
}

type Achievement = EarnedAchievement | LockedAchievement
type Section = { title: string; items: (EarnedAchievement | LockedAchievement)[] }

function isEarned(a: Achievement): a is EarnedAchievement {
  return (a as EarnedAchievement).earnedAt !== undefined
}

type AchievementRow = {
  achievement_id: number
  name: string
  description?: string
  xp_reward: number
  topic_id: number | null
  earned_at: string | null
  earned: boolean
}

type TopicXpRow = {
  topic_id: number
  xp: number
}

type AchievementsApiResponse = {
  computingId: string
  achievementRows: AchievementRow[]
  topicXpRows: TopicXpRow[]
  totalXp: number
}

function AchievementIcon({achievementId, grayscale,}: {
  achievementId: number
  grayscale?: boolean
}) {
  const src = `/api/achievements/${achievementId}/icon`

  return (
    <div
      className={`h-20 w-20 overflow-hidden rounded-full bg-white shadow-sm flex items-center justify-center ${
        grayscale ? 'opacity-50' : ''
      }`}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-contain"
      />
    </div>
  )
}
function xpGoalForId(id: number): number {
  if ((id >= 2001 && id <= 2005) || (id >= 3001 && id <= 3005)) {
    return 400
  }
  return 0
}


function isXpBasedId(id: number): boolean {
  return (id >= 2001 && id <= 2005) || (id >= 3001 && id <= 3005)
}

function isSituationBasedId(id: number): boolean {
  return (id >= 1001 && id <= 1005) || id === 2006 || id === 3006
}

function getXpLevel(xp: number): 0 | 1 | 2 | 3 {
  if (xp >= 400) return 3
  if (xp >= 180) return 2
  if (xp >= 60)  return 1
  return 0
}

function levelToRingClass(level: 0 | 1 | 2 | 3): string {
  switch (level) {
    case 0:
      return 'from-slate-200 to-slate-400'     // grey
    case 1:
      return 'from-amber-900 to-orange-500'    // copper
    case 2:
      return 'from-gray-200 to-gray-400'       // silver
    case 3:
    default:
      return 'from-yellow-200 to-amber-400'    // gold
  }
}

function sectionTitleForId(idNum: number): string {
  if (idNum >= 1000 && idNum < 2000) return 'Basic Journey'
  if (idNum >= 2000 && idNum < 3000) return 'Data Structures'
  if (idNum >= 3000 && idNum < 4000) return 'Algorithms'
  return 'Other Achievements'
}

function logicalIdForId(idNum: number): string {
  if (idNum >= 1000 && idNum < 2000) return `basic-${idNum}`
  if (idNum >= 2000 && idNum < 3000) return `ds-${idNum}`
  if (idNum >= 3000 && idNum < 4000) return `algo-${idNum}`
  return `level-${idNum}`
}

function buildSections(achievementRows: AchievementRow[], topicXpRows: TopicXpRow[]): Section[] {
  // map topic_id -> xp from solved problems
  const topicXpMap = new Map<number, number>(
    topicXpRows.map((row) => [Number(row.topic_id), Number(row.xp)])
  )

  const sectionsMap = new Map<string, Section>() // title -> Section

  const ensureSection = (title: string): Section => {
    if (!sectionsMap.has(title)) {
      sectionsMap.set(title, { title, items: [] })
    }
    return sectionsMap.get(title)!
  }

  for (const row of achievementRows) {
    const idNum = Number(row.achievement_id)
    const sectionTitle = sectionTitleForId(idNum) 
    const section = ensureSection(sectionTitle)

    const earned = row.earned
    const earnedAt = row.earned_at
    const topicId = Number(row.topic_id ?? 0)
    const xpForTopic = topicXpMap.get(topicId) || 0

    const xpGoal = xpGoalForId(idNum)
    const logicalId = logicalIdForId(idNum)

    if (earned) {
      // unlocked badge
      section.items.push({
        id: logicalId,
        achievementId: idNum,
        name: row.name,
        description: row.description,
        earnedAt: earnedAt
          ? new Date(earnedAt).toISOString()
          : new Date().toISOString(),
      })
    } else {
      // locked badge with progress bar
      section.items.push({
        id: logicalId,
        name: row.name,
        achievementId: idNum,  
        description: row.description,
        xp: xpForTopic,
        xpGoal: xpGoal || 1, // avoid divide-by-zero
      })
    }
  }

  return Array.from(sectionsMap.values())
}

function fmtDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
   
function Modal({
  open,
  onClose,
  achievement
}: {
  open: boolean
  onClose: () => void
  achievement?: Achievement
}) {
  if (!open || !achievement) return null
  const earned = isEarned(achievement)
  const xpBased = isXpBasedId(achievement.achievementId)

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose()
      }}
    >
      <div className="w-[min(520px,92vw)] rounded-2xl border border-border bg-card text-card-foreground shadow p-4">
        <header className="mb-2 flex items-center gap-3">
          <div className="mb-2 flex justify-center">
            <AchievementIcon
              achievementId={achievement.achievementId}
              grayscale={!earned && !isXpBasedId(achievement.achievementId)}
            />
          </div>
          <h3 className="text-xl font-semibold">{achievement.name}</h3>
          <button
            aria-label="Close"
            onClick={onClose}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent/60"
          >
            ×
          </button>
        </header>
        <div className="leading-relaxed">
          {achievement.description || 'No description provided.'}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{earned ? `Earned on ${fmtDate(achievement.earnedAt)}` : 'Not earned yet'}</span>
          {!earned && (
            <span>
              Progress: {(achievement as LockedAchievement).xp} /{' '}
              {(achievement as LockedAchievement).xpGoal} XP
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function BadgeCard({ a, onClick }: { a: Achievement; onClick: () => void }) {
  const earned = isEarned(a)
  const idNum = a.achievementId
  const xpBased = isXpBasedId(idNum)
  const situationBased = isSituationBasedId(idNum)

  const hasXpField = !earned && 'xp' in a
  const currentXp = xpBased && hasXpField ? (a as LockedAchievement).xp : 0

  let level: 0 | 1 | 2 | 3
  if (xpBased) {
    level = getXpLevel(currentXp)
  } else if (situationBased) {
    level = earned ? 3 : 0
  } else {
    level = earned ? 3 : 0
  }

  const ringClass = levelToRingClass(level)
  const grayscale = level === 0

  const showProgress = xpBased && !earned && 'xpGoal' in a
  const percent = useMemo(
    () => (!earned && 'xpGoal' in a ? Math.min(100, Math.round((a.xp / a.xpGoal) * 100)) : 100),
    [a, earned]
  )

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${a.name} ${earned ? 'earned' : 'locked'}`}
      className="group relative rounded-2xl border border-border bg-card p-4 text-left text-card-foreground shadow transition hover:shadow-lg"
    >
      <div
        className={`badge grid h-20 w-20 place-items-center rounded-2xl ring-1 shadow bg-gradient-to-br from-yellow-200 to-amber-400 ring-yellow-200/40 ${
          earned ? '' : 'grayscale-[.85]'
        }`}
      >
        <AchievementIcon
          achievementId={a.achievementId}
          grayscale={!earned}
        />
      </div>
      <div className="mt-1 text-sm font-semibold">{a.name}</div>
      <div className="text-xs text-muted-foreground">
        {earned ? `Earned on ${fmtDate(a.earnedAt)}` : 'Not earned yet'}
      </div>

     {showProgress ? (
        <>
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full border bg-muted">
            <div className="absolute right-2 -top-5 text-xs text-muted-foreground">
              {(a as LockedAchievement).xp}/{(a as LockedAchievement).xpGoal} XP
            </div>
            <div
              className="h-full w-0 rounded-full bg-gradient-to-r from-amber-400 to-blue-400 transition-[width] duration-1000"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {percent >= 100 ? 'Ready to claim' : `${percent}% complete`}
          </div>
        </>
      ) : (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full border bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          {earned
            ? 'Unlocked'
            : situationBased
              ? 'Complete the condition to unlock'
              : 'Start solving problems to gain XP'}
        </div>
      )}
    </button>
  )
}


export default function Page() {
  const [data, setData] = useState<Section[]>([])
  const [totalXp, setTotalXp] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Achievement | undefined>(undefined)

  useEffect(() => {
    const LoadAchievements = async () => {
      try {
        const res = await fetch('/api/achievements', {
          method: 'GET',
        })

        if (!res.ok) {
          throw new Error('Failed to load achievements')
        }

        const json = await res.json() as {
          computingId: string
          achievements: AchievementRow[]
          topicXp: TopicXpRow[]
          totalXp: number
        }
        console.log('API achievements:', json)

        const sections = buildSections(json.achievements, json.topicXp)
        setData(sections)
        setTotalXp(json.totalXp || 0)
      } catch (err) {
        console.error('[Achievements] Error loading', err)
        setError('Could not load achievements from server.')
      } finally {
        setLoading(false)
      }
    }

    LoadAchievements()
  },[])
  return (
   <main className="mx-auto mb-16 mt-10 max-w-[1100px] px-5">
      <header className="mb-3 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">All Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Click any badge to see details.
        </p>
        <span className="ml-auto text-sm text-muted-foreground">
          Total XP:{' '}
          <span className="font-semibold text-primary">{totalXp}</span>
        </span>
      </header>

      {loading && (
        <p className="mb-4 text-sm text-muted-foreground">
          Loading achievements...
        </p>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          No achievements yet.
        </p>
      )}
      
      {data.map((sec) => (
        <section key={sec.title} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{sec.title}</h2>
          <div
            className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]"
            aria-live="polite"
          >
            {sec.items.map((a) => (
              <BadgeCard
                key={a.id}
                a={a}
                onClick={() => {
                  setCurrent(a)
                  setOpen(true)
                }}
              />
            ))}
          </div>
        </section>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} achievement={current} />
    </main>
  )
}
