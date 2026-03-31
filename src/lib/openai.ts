import OpenAI from 'openai'
import { prisma } from './prisma'

/**
 * Obtém um cliente OpenAI configurado com a API key do usuário
 */
export async function getOpenAIClient(userId: string): Promise<OpenAI | null> {
  const integration = await prisma.integration.findFirst({
    where: {
      userId,
      type: 'openai',
      isConnected: true
    }
  })

  if (!integration?.config) {
    return null
  }

  const config = integration.config as { apiKey?: string }
  if (!config.apiKey) {
    return null
  }

  return new OpenAI({ apiKey: config.apiKey })
}

/**
 * Analisa uma transcrição de reunião e extrai tarefas acionáveis
 */
export async function analyzeTranscript(
  text: string,
  openai: OpenAI
): Promise<{ tasks: { title: string; description?: string }[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em analisar transcrições de reuniões e extrair tarefas acionáveis.

Analise o texto da transcrição e identifique:
- Ações que foram atribuídas a alguém
- Compromissos assumidos pelos participantes
- Decisões que requerem implementação
- Próximos passos mencionados
- Prazos ou deadlines discutidos

Para cada tarefa identificada, retorne em formato JSON:
{
  "tasks": [
    {
      "title": "Título claro e conciso da tarefa (máximo 100 caracteres)",
      "description": "Contexto adicional se necessário (opcional)"
    }
  ]
}

Regras importantes:
- Extraia apenas tarefas CLARAS e ACIONÁVEIS
- Evite tarefas vagas como "discutir algo" ou "pensar sobre"
- O título deve começar com um verbo de ação
- Se não encontrar tarefas claras, retorne um array vazio
- Máximo de 10 tarefas por transcrição`
        },
        {
          role: 'user',
          content: `Analise esta transcrição de reunião e extraia as tarefas:\n\n${text}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000
    })

    const content = response.choices[0].message.content
    if (!content) {
      return { tasks: [] }
    }

    const result = JSON.parse(content)
    return { tasks: result.tasks || [] }
  } catch (error) {
    console.error('Error analyzing transcript with OpenAI:', error)
    return { tasks: [] }
  }
}
