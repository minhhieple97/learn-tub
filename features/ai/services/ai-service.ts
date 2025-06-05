import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { AI_DEFAULTS } from '@/config/constants';

// Schema for quiz generation
const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string(),
    }),
  ),
})

// Schema for note analysis
const NoteAnalysisSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  knowledgeGaps: z.array(z.string()),
  suggestions: z.array(z.string()),
  comprehensionScore: z.number().min(0).max(100),
})

export class AIService {
  private model = openai(AI_DEFAULTS.SERVICE_MODEL);

  async analyzeNotes(notes: string[], videoTitle: string): Promise<any> {
    try {
      const notesText = notes.join('\n\n');

      const { object } = await generateObject({
        model: this.model,
        schema: NoteAnalysisSchema,
        prompt: `
          Analyze these learning notes from a video titled "${videoTitle}":
          
          ${notesText}
          
          Provide:
          1. A concise summary of the main concepts
          2. Key points extracted from the notes
          3. Potential knowledge gaps or areas that need more attention
          4. Specific suggestions for improving understanding
          5. A comprehension score (0-100) based on note quality and depth
          
          Be constructive and educational in your feedback.
        `,
      });

      return object;
    } catch (error) {
      console.error('Error analyzing notes:', error);
      throw new Error('Failed to analyze notes');
    }
  }

  async generateQuiz(
    notes: string[],
    videoTitle: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  ): Promise<any> {
    try {
      const notesText = notes.join('\n\n');

      const { object } = await generateObject({
        model: this.model,
        schema: QuizSchema,
        prompt: `
          Create a ${difficulty} level quiz based on these learning notes from "${videoTitle}":
          
          ${notesText}
          
          Generate 5 multiple-choice questions that test understanding of the key concepts.
          Each question should have 4 options with only one correct answer.
          Include explanations for why each answer is correct.
          
          Make questions that test:
          - Factual recall
          - Conceptual understanding
          - Application of concepts
          
          Difficulty level: ${difficulty}
        `,
      });

      return object;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  async generateStudyPlan(
    notes: string[],
    videoTitle: string,
    learningGoals: string[],
  ): Promise<string> {
    try {
      const notesText = notes.join('\n\n');
      const goalsText = learningGoals.join(', ');

      const { text } = await generateText({
        model: this.model,
        prompt: `
          Create a personalized study plan based on:
          
          Video: "${videoTitle}"
          Notes: ${notesText}
          Learning Goals: ${goalsText}
          
          Provide a structured study plan with:
          1. Review schedule for key concepts
          2. Practice exercises or activities
          3. Additional resources to explore
          4. Milestones to track progress
          5. Time estimates for each activity
          
          Make it actionable and specific to the content covered.
        `,
      });

      return text;
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new Error('Failed to generate study plan');
    }
  }

  async provideFeedback(noteContent: string, timestamp: number): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: `
          Provide constructive feedback on this learning note:
          
          "${noteContent}"
          
          Give specific suggestions for:
          1. How to improve the note quality
          2. Additional questions to explore
          3. Connections to broader concepts
          4. Ways to better organize the information
          
          Keep feedback encouraging and educational. Limit to 2-3 sentences.
        `,
      });

      return text;
    } catch (error) {
      console.error('Error providing feedback:', error);
      throw new Error('Failed to provide feedback');
    }
  }
}

export const aiService = new AIService()
