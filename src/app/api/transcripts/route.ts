import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'
import { getOpenAIClient, analyzeTranscript } from '@/lib/openai'

export const dynamic = 'force-dynamic'

// GET /api/transcripts - Listar transcrições da organização
export async function GET() {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)

    // Transcrições cujo goal.project pertence à organização
    // (Transcrições sem goal NÃO aparecem — ver backlog item 10)
    const transcripts = await prisma.meetingTranscript.findMany({
      where: {
        goal: { project: scope }
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                name: true,
                color: true,
                userId: true
              }
            }
          }
        },
        suggestedTasks: {
          include: {
            suggestedGoal: true,
            suggestedResponsible: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { suggestedTasks: true }
        }
      },
      orderBy: { meetingDate: 'desc' }
    })

    // Adicionar contagem de tarefas aprovadas
    const transcriptsWithCounts = transcripts.map(t => ({
      ...t,
      approvedTasks: t.suggestedTasks.filter(st => st.status === 'APPROVED').length,
      pendingTasks: t.suggestedTasks.filter(st => st.status === 'PENDING').length,
    }))

    return NextResponse.json(transcriptsWithCounts)
  } catch (error) {
    console.error('Error fetching transcripts:', error)
    return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
  }
}

// POST /api/transcripts - Criar transcrição
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)

    const body = await request.json()
    const { title, transcriptText, meetingDate, goalId } = body

    if (!title || !transcriptText) {
      return NextResponse.json(
        { error: 'Title and transcript text are required' },
        { status: 400 }
      )
    }

    // Se tem goalId, verificar se a meta pertence à organização
    if (goalId) {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, project: scope }
      })
      if (!goal) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
      }
    }

    // Criar transcrição
    const transcript = await prisma.meetingTranscript.create({
      data: {
        title,
        transcriptText,
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
        processed: false,
        goalId: goalId || null,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                name: true,
                color: true
              }
            }
          }
        },
        suggestedTasks: true,
        _count: {
          select: { suggestedTasks: true }
        }
      }
    })

    // Tentar analisar com OpenAI (se configurado)
    try {
      const openai = await getOpenAIClient(user.id)

      if (openai) {
        console.log('OpenAI configured, analyzing transcript...')
        const analysis = await analyzeTranscript(transcriptText, openai)

        if (analysis.tasks.length > 0) {
          // Criar suggested tasks
          await prisma.suggestedTask.createMany({
            data: analysis.tasks.map(task => ({
              suggestedTitle: task.title,
              transcriptId: transcript.id,
              status: 'PENDING',
              suggestedGoalId: goalId || null,
            }))
          })

          // Marcar como processado
          await prisma.meetingTranscript.update({
            where: { id: transcript.id },
            data: { processed: true }
          })

          // Buscar transcrição atualizada com as tarefas
          const updatedTranscript = await prisma.meetingTranscript.findUnique({
            where: { id: transcript.id },
            include: {
              goal: {
                select: {
                  id: true,
                  title: true,
                  project: {
                    select: {
                      name: true,
                      color: true
                    }
                  }
                }
              },
              suggestedTasks: {
                include: {
                  suggestedGoal: true,
                  suggestedResponsible: true,
                },
                orderBy: { createdAt: 'desc' }
              },
              _count: {
                select: { suggestedTasks: true }
              }
            }
          })

          return NextResponse.json({
            ...updatedTranscript,
            approvedTasks: 0,
            pendingTasks: analysis.tasks.length,
          }, { status: 201 })
        }
      } else {
        console.log('OpenAI not configured, skipping transcript analysis')
      }
    } catch (llmError) {
      // Logar erro mas não falhar a requisição
      console.error('Error analyzing transcript with LLM:', llmError)
    }

    return NextResponse.json({
      ...transcript,
      approvedTasks: 0,
      pendingTasks: 0,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating transcript:', error)
    return NextResponse.json({ error: 'Failed to create transcript' }, { status: 500 })
  }
}
