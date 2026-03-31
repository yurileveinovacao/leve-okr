import { Target, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ObjectiveHeaderProps {
  title: string
  description?: string
  quarter: string
  totalGoals: number
  completedGoals: number
  overallProgress: number
}

export function ObjectiveHeader({
  title,
  description,
  quarter,
  totalGoals,
  completedGoals,
  overallProgress,
}: ObjectiveHeaderProps) {
  return (
    <Card className="bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
              <Calendar className="h-4 w-4" />
              <span>{quarter}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-8 w-8" />
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            {description && (
              <p className="text-blue-100 mt-2">{description}</p>
            )}
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold">{overallProgress}%</div>
            <div className="text-blue-100 text-sm">progresso geral</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>{completedGoals} de {totalGoals} metas concluídas</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-blue-400/30">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
