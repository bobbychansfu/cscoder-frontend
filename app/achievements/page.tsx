'use client'

import { useMemo, useState } from 'react'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
type EarnedAchievement = {
  id: string
  name: string
  description?: string
  earnedAt: string // ISO date string
}

type LockedAchievement = {
  id: string
  name: string
  description?: string
  xp: number
  xpGoal: number
}

type Achievement = EarnedAchievement | LockedAchievement
type Section = { title: string; items: Achievement[] }

function isEarned(a: Achievement): a is EarnedAchievement {
  return (a as EarnedAchievement).earnedAt !== undefined
}

// ------------------------------------------------------------
// Demo data by SECTION (replace with API results later)
// ------------------------------------------------------------
const sections: Section[] = [
  {
    title: 'Basic Skills',
    items: [
      {
        id: 'basic-hello-world',
        name: 'Hello, World!',
        description: 'Your first successful submission.',
        earnedAt: '2025-08-01T14:22:00Z'
      },
      {
        id: 'basic-syntax-tamer',
        name: 'Syntax Tamer',
        description: 'Solve problems that require correct syntax & I/O.',
        xp: 120,
        xpGoal: 300
      },
      {
        id: 'basic-loop-master',
        name: 'Loop Master',
        description: 'Solve loop-focused challenges.',
        xp: 40,
        xpGoal: 200
      },
      {
        id: 'basic-recursive-thinker',
        name: 'Recursive Thinker',
        description: 'Crack recursion problems without stack overflow (yours!).',
        xp: 80,
        xpGoal: 250
      },
      {
        id: 'basic-code-alchemist',
        name: 'Code Alchemist',
        description: 'Complete all Basic Skills challenges.',
        xp: 0,
        xpGoal: 1000
      }
    ]
  },
  {
    title: 'Data Structures',
    items: [
      {
        id: 'ds-array-apprentice',
        name: 'Array Apprentice',
        description: 'Solve your first array problem.',
        earnedAt: '2025-06-15T04:10:00Z'
      },
      {
        id: 'ds-linked-list-builder',
        name: 'Linked List Builder',
        description: 'Implement/solve linked list tasks.',
        xp: 180,
        xpGoal: 400
      },
      {
        id: 'ds-stack-commander',
        name: 'Stack Commander',
        description: 'Master stack & queue problems.',
        xp: 260,
        xpGoal: 500
      },
      {
        id: 'ds-tree-whisperer',
        name: 'Tree Whisperer',
        description: 'Traverse and query trees with confidence.',
        xp: 150,
        xpGoal: 600
      },
      {
        id: 'ds-graph-explorer',
        name: 'Graph Explorer',
        description: 'Solve BFS/DFS style problems.',
        xp: 320,
        xpGoal: 700
      },
      {
        id: 'ds-data-architect',
        name: 'Data Architect',
        description: 'Complete all Data Structures challenges.',
        xp: 520,
        xpGoal: 1200
      }
    ]
  },
  {
    title: 'Algorithms',
    items: [
      {
        id: 'algo-sorting-sorcerer',
        name: 'Sorting Sorcerer',
        description: 'Tame arrays with O(n log n) flair.',
        earnedAt: '2025-01-05T19:30:00Z'
      },
      {
        id: 'algo-search-seeker',
        name: 'Search Seeker',
        description: 'Binary search, two-pointers… seek and you shall find.',
        xp: 110,
        xpGoal: 300
      },
      {
        id: 'algo-greedy-strategist',
        name: 'Greedy Strategist',
        description: 'Pick locally optimal moves for global wins.',
        xp: 72,
        xpGoal: 200
      },
      {
        id: 'algo-divide-conqueror',
        name: 'Divide & Conqueror',
        description: 'Split problems and rule the subproblems.',
        xp: 220,
        xpGoal: 500
      },
      {
        id: 'algo-dp-mastermind',
        name: 'DP Mastermind',
        description: 'Memoize/tabulate your way to victory.',
        xp: 460,
        xpGoal: 1000
      },
      {
        id: 'algo-grandmaster',
        name: 'Algorithm Grandmaster',
        description: 'Complete all Algorithm challenges.',
        xp: 890,
        xpGoal: 2000
      }
    ]
  },
  {
    title: 'Level-Up',
    items: [
      {
        id: 'level-rising-coder',
        name: 'Rising Coder',
        description: 'Reach Level 5 overall.',
        xp: 72,
        xpGoal: 100
      },
      {
        id: 'level-bug-slayer',
        name: 'Bug Slayer',
        description: 'Reach Level 10 overall.',
        xp: 460,
        xpGoal: 1000
      },
      {
        id: 'level-code-warrior',
        name: 'Code Warrior',
        description: 'Reach Level 20 overall.',
        xp: 1200,
        xpGoal: 2000
      },
      {
        id: 'level-legendary-dev',
        name: 'Legendary Developer',
        description: 'Reach max level.',
        xp: 0,
        xpGoal: 5000
      }
    ]
  }
]

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function fmtDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function iconFor(id: string) {
  // BASIC = star/book
  if (id.startsWith('basic'))
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 5a3 3 0 013-3h11v17H7a3 3 0 00-3 3V5zM7 2v17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  // DATA STRUCTURES = stacked boxes / target
  if (id.startsWith('ds'))
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  // ALGORITHMS = chess rook
  if (id.startsWith('algo'))
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 9h10V5l-2-2h-6L7 5v4Zm-2 11h14v-2l-2-5H7l-2 5v2Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  // LEVEL-UP = trophy
  if (id.startsWith('level'))
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M8 4h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V4Zm-3 3h3a4 4 0 0 1-4 4V7Zm14 0h3v4a4 4 0 0 1-4-4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M9 19h6M8 16h8v3H8z" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  return null
}

// ------------------------------------------------------------
// Components
// ------------------------------------------------------------
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

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose()
      }}
    >
      <div className="w-[min(520px,92vw)] rounded-2xl border border-border bg-card text-card-foreground shadow p-4">
        <header className="mb-2 flex items-center gap-3">
          <div
            className={`badge grid h-20 w-20 place-items-center rounded-2xl ring-1 shadow bg-gradient-to-br from-yellow-200 to-amber-400 ring-yellow-200/40 ${
              earned ? '' : 'grayscale-[.85]'
            }`}
          >
            <div className="h-12 w-12 text-primary">{iconFor(achievement.id)}</div>
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
        <div className="h-12 w-12 text-primary">{iconFor(a.id)}</div>
      </div>
      <div className="mt-1 text-sm font-semibold">{a.name}</div>
      <div className="text-xs text-muted-foreground">
        {earned ? `Earned on ${fmtDate(a.earnedAt)}` : 'Not earned yet'}
      </div>

      {!earned && 'xpGoal' in a ? (
        <>
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full border bg-muted">
            <div className="absolute right-2 -top-5 text-xs text-muted-foreground">
              {a.xp}/{a.xpGoal} XP
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
          Unlocked
        </div>
      )}
    </button>
  )
}

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------
export default function Page() {
  const [data] = useState<Section[]>(sections)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Achievement | undefined>(undefined)

  return (
    <main className="mx-auto mb-16 mt-10 max-w-[1100px] px-5">
      <header className="mb-3 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">All Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Click any badge to see details. Locked ones show your XP progress.
        </p>
      </header>

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
