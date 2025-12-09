type AchievementIconProps = {
  achievementId: number
  grayscale?: boolean
}

export function AchievementIcon({achievementId, grayscale,}: AchievementIconProps) {
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