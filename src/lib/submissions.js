import { supabase } from './supabase'

export async function saveWritingSubmission(userId, data) {
  const { taskType, essay, feedback, question, questionImageUrl, isHomework } = data
  const wordCount = essay.split(/\s+/).filter(Boolean).length

  const row = {
    user_id: userId,
    task_type: taskType,
    essay,
    word_count: wordCount,
    overall_band: feedback?.overall_band || null,
    score_ta: taskType === 'task1' ? feedback?.scores?.task_achievement : null,
    score_tr: taskType === 'task2' ? feedback?.scores?.task_achievement : null,
    score_cc: feedback?.scores?.coherence_cohesion || null,
    score_lr: feedback?.scores?.lexical_resource || null,
    score_gra: feedback?.scores?.grammatical_range || null,
    feedback_json: feedback?.submitted ? null : feedback,
  }
  if (question) row.question = question
  if (questionImageUrl) row.question_image_url = questionImageUrl
  if (isHomework) row.is_homework = true

  const { data: result, error } = await supabase
    .from('writing_submissions')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return { data: result, error }
}

export async function saveSpeakingSubmission(userId, data) {
  const { part, question, transcript, audioUrl, feedback } = data
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 1주 후 만료

  const { data: row, error } = await supabase
    .from('speaking_submissions')
    .insert({
      user_id: userId,
      part,
      question,
      transcript,
      audio_url: audioUrl,
      audio_expires_at: audioUrl ? expiresAt.toISOString() : null,
      overall_band: feedback.overall_band,
      score_fluency: feedback.scores.fluency_coherence,
      score_lexical: feedback.scores.lexical_resource,
      score_grammar: feedback.scores.grammatical_range,
      feedback_json: feedback,
      model_answer: feedback.model_answer,
    })
    .select()
    .single()

  return { data: row, error }
}

export async function getWritingHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('writing_submissions')
    .select('id, task_type, word_count, overall_band, score_cc, score_lr, score_gra, score_ta, score_tr, question, question_image_url, essay, is_homework, teacher_band, teacher_feedback, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getSpeakingHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('speaking_submissions')
    .select('id, part, question, overall_band, score_fluency, score_lexical, score_grammar, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getSubmissionDetail(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

export async function useCredit(userId) {
  const { data, error } = await supabase.rpc('use_credit', { user_id: userId })
  return { data, error }
}
