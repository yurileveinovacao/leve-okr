import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface GoalCardProps {
  title: string
  currentValue: number
  targetValue: number
  unit: string
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED'
  responsible?: string
  projectName?: string
  projectColor?: string
}

const statusConfig = {
  ON_TRACK: { label: 'No caminho', variant: 'success' as const, icon: TrendingUp },
  AT_RISK: { label: 'Em risco', variant: 'warning' as const, icon: Minus },
  BEHIND: { label: 'Atrasado', variant: 'destructive' as const, icon: TrendingDown },
  COMPLETED: { label: 'Concluído', variant: 'default' as const, icon: Target },
}

export function GoalCard({
  title,
  currentValue,
  targetValue,
  unit,
  status,
  responsible,
  projectName,
  projectColor,
}: GoalCardProps) {
  const percentage = Math.round((currentValue / targetValue) * 100)
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Badge variant={config.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">
              {currentValue.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              de {targetValue.toLocaleString('pt-BR')} {unit}
            </span>
          </div>

          <Progress value={percentage} />

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              {percentage}% concluído
            </span>
            {responsible && (
              <span className="text-[var(--muted-foreground)]">
                {responsible}
              </span>
            )}
          </div>

          {projectName && (
            <div className="flex items-center gap-2 pt-2 border-t mt-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: projectColor || '#6366f1' }}
              />
              <span className="text-xs text-[var(--muted-foreground)]">{projectName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
