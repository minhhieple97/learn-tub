"use server"

import { createClient } from "@/lib/supabase/server"
import { aiService } from "../services/ai-service"

export async function analyzeNotesAction(videoId: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get video info
    const { data: video } = await supabase
      .from("videos")
      .select("title, youtube_id")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single()

    if (!video) {
      return { error: "Video not found" }
    }

    // Get user's notes for this video
    const { data: notes } = await supabase
      .from("notes")
      .select("content")
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .order("timestamp_seconds")

    if (!notes || notes.length === 0) {
      return { error: "No notes found for analysis" }
    }

    const noteContents = notes.map((note) => note.content)
    const analysis = await aiService.analyzeNotes(noteContents, video.title)

    // Store AI interaction
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      interaction_type: "note_analysis",
      input_data: { video_id: videoId, notes_count: notes.length },
      output_data: analysis,
    })

    return { success: true, analysis }
  } catch (error) {
    console.error("Error analyzing notes:", error)
    return { error: "Failed to analyze notes" }
  }
}

export async function generateQuizAction(videoId: string, difficulty: "easy" | "medium" | "hard" = "medium") {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get video info
    const { data: video } = await supabase
      .from("videos")
      .select("title")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single()

    if (!video) {
      return { error: "Video not found" }
    }

    // Get user's notes for this video
    const { data: notes } = await supabase
      .from("notes")
      .select("content")
      .eq("video_id", videoId)
      .eq("user_id", user.id)

    if (!notes || notes.length === 0) {
      return { error: "No notes found for quiz generation" }
    }

    const noteContents = notes.map((note) => note.content)
    const quiz = await aiService.generateQuiz(noteContents, video.title, difficulty)

    // Store AI interaction
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      interaction_type: "quiz_generation",
      input_data: { video_id: videoId, difficulty, notes_count: notes.length },
      output_data: quiz,
    })

    return { success: true, quiz }
  } catch (error) {
    console.error("Error generating quiz:", error)
    return { error: "Failed to generate quiz" }
  }
}

export async function generateStudyPlanAction(videoId: string, learningGoals: string[]) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Authentication required" }
    }

    // Get video info
    const { data: video } = await supabase
      .from("videos")
      .select("title")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single()

    if (!video) {
      return { error: "Video not found" }
    }

    // Get user's notes for this video
    const { data: notes } = await supabase
      .from("notes")
      .select("content")
      .eq("video_id", videoId)
      .eq("user_id", user.id)

    if (!notes || notes.length === 0) {
      return { error: "No notes found for study plan generation" }
    }

    const noteContents = notes.map((note) => note.content)
    const studyPlan = await aiService.generateStudyPlan(noteContents, video.title, learningGoals)

    // Store AI interaction
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      interaction_type: "study_plan",
      input_data: { video_id: videoId, learning_goals: learningGoals },
      output_data: { study_plan: studyPlan },
    })

    return { success: true, studyPlan }
  } catch (error) {
    console.error("Error generating study plan:", error)
    return { error: "Failed to generate study plan" }
  }
}

export async function getNoteFeedbackAction(noteContent: string, timestamp: number) {
  try {
    const feedback = await aiService.provideFeedback(noteContent, timestamp)
    return { success: true, feedback }
  } catch (error) {
    console.error("Error getting note feedback:", error)
    return { error: "Failed to get feedback" }
  }
}
