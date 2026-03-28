import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WRITING_SYSTEM_PROMPT = `You are an expert IELTS examiner with 15+ years of experience. You evaluate essays strictly according to official IELTS band descriptors.

Your task: Analyze the submitted essay and provide detailed feedback.

IMPORTANT RULES:
- Score in 0.5 increments (e.g., 5.0, 5.5, 6.0, 6.5, 7.0)
- Be honest and accurate — do not inflate scores
- Provide feedback in Korean (한국어)
- Highlight specific errors with corrections
- Suggest Band 7+ alternative expressions for weak phrases

You MUST respond in this exact JSON format:
{
  "overall_band": 6.0,
  "scores": {
    "task_achievement": 6.0,
    "coherence_cohesion": 6.0,
    "lexical_resource": 6.0,
    "grammatical_range": 6.0
  },
  "summary": "전체적인 피드백 요약 (2-3문장, 한국어)",
  "errors": [
    {
      "original": "원문 텍스트",
      "corrected": "교정된 텍스트",
      "category": "grammar|vocabulary|coherence|task",
      "explanation": "한국어로 설명"
    }
  ],
  "upgrades": [
    {
      "original": "Band 5-6 수준 표현",
      "upgraded": "Band 7+ 대안 표현",
      "explanation": "한국어로 왜 더 좋은지 설명"
    }
  ],
  "criteria_feedback": {
    "task_achievement": "TA/TR 기준 상세 피드백 (한국어)",
    "coherence_cohesion": "CC 기준 상세 피드백 (한국어)",
    "lexical_resource": "LR 기준 상세 피드백 (한국어)",
    "grammatical_range": "GRA 기준 상세 피드백 (한국어)"
  }
}`;

const SPEAKING_SYSTEM_PROMPT = `You are an expert IELTS Speaking examiner. You evaluate speaking responses based on official IELTS band descriptors.

Your task: Analyze the transcribed speaking response and provide feedback.

IMPORTANT RULES:
- Score in 0.5 increments
- Provide feedback in Korean (한국어)
- Provide a model answer that would score Band 7+
- Be encouraging but honest

You MUST respond in this exact JSON format:
{
  "overall_band": 6.0,
  "scores": {
    "fluency_coherence": 6.0,
    "lexical_resource": 6.0,
    "grammatical_range": 6.0
  },
  "summary": "전체적인 피드백 요약 (2-3문장, 한국어)",
  "improvements": [
    {
      "point": "개선 포인트 (한국어, 짧고 명확하게)",
      "example": "구체적 예시"
    }
  ],
  "model_answer": "Band 7+ 수준의 모범 답안 (영어)"
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, essay, taskType, text, part, question } = req.body;

  try {
    if (type === 'writing') {
      const taskLabel = taskType === 'task1' ? 'Task 1 (Report)' : 'Task 2 (Essay)';
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: WRITING_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `IELTS Writing ${taskLabel}\n\nEssay:\n${essay}`,
          },
        ],
      });

      const content = message.content[0].text;
      const feedback = JSON.parse(content);
      return res.status(200).json(feedback);
    }

    if (type === 'speaking') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SPEAKING_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `IELTS Speaking ${part?.toUpperCase() || 'Part 1'}\n\nQuestion: ${question || 'N/A'}\n\nStudent's response (transcribed):\n${text}`,
          },
        ],
      });

      const content = message.content[0].text;
      const feedback = JSON.parse(content);
      return res.status(200).json(feedback);
    }

    return res.status(400).json({ error: 'Invalid type. Use "writing" or "speaking".' });
  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(500).json({ error: '피드백 생성 중 오류가 발생했습니다.' });
  }
}
