import {
  AI_SYSTEM_MESSAGES,
  AI_FORMAT,
  ERROR_MESSAGES,
  EVALUATION_ERRORS,
  AI_QUIZZ_CONFIG,
  AI_COMMANDS,
} from "@/config/constants";
import { INoteEvaluationRequest } from "@/features/notes/types";
import { IFeedback } from "@/types";
import { getAIModelName, createNoteInteraction } from "../queries";
import type { ITokenUsage } from "@/features/ai/types";
import { streamText } from "ai";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { deductCredits } from "@/features/payments/services/deduction-credit";
import { aiClient } from "@/features/ai/services/ai-client";

class NoteService {
  async evaluateNote(
    request: INoteEvaluationRequest,
  ): Promise<{ value: StreamableValue }> {
    const { aiModelId, content, context, userId, noteId } = request;
    const prompt = this.createEvaluationPrompt(content, context);

    const { data: modelData, error: modelError } =
      await getAIModelName(aiModelId);

    if (modelError || !modelData?.model_name) {
      throw new Error(
        `${EVALUATION_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`,
      );
    }

    const modelName = modelData.model_name;

    const stream = createStreamableValue("");

    (async () => {
      let streamClosed = false;

      try {
        const model = aiClient.getModel(modelName);

        let finalUsage: ITokenUsage | undefined;

        const result = streamText({
          model,
          messages: [
            {
              role: "system",
              content: AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          onFinish: ({ usage }) => {
            if (usage) {
              finalUsage = {
                input_tokens: usage.promptTokens || 0,
                output_tokens: usage.completionTokens || 0,
                total_tokens: usage.totalTokens || 0,
              };
              console.info("Final usage:", finalUsage);
            }
          },
        });

        let fullContent = "";

        for await (const chunk of result.textStream) {
          fullContent += chunk;
          stream.update(chunk);
        }

        try {
          const feedback = this.parseFeedbackFromResponse(fullContent);

          await createNoteInteraction(userId, noteId, aiModelId, feedback);

          const creditResult = await deductCredits({
            userId,
            command: AI_COMMANDS.EVALUATE_NOTE as NonNullable<
              typeof AI_COMMANDS.EVALUATE_NOTE
            >,
            description: `Note evaluation for note: ${noteId}`,
            relatedActionId: noteId,
          });

          if (!creditResult.success) {
            console.error("Failed to deduct credits:", creditResult.error);
          }

          stream.update(`__COMPLETE__${JSON.stringify(feedback)}`);
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          const fallbackFeedback = {
            summary:
              "AI evaluation completed but response format was unexpected",
            correct_points: [],
            incorrect_points: [],
            improvement_suggestions: ["Please try the evaluation again"],
            overall_score: 0,
            detailed_analysis: fullContent || "No content received",
          };
          stream.update(`__COMPLETE__${JSON.stringify(fallbackFeedback)}`);
        }
      } catch (error) {
        console.error("Evaluation error:", error);
        const errorMessage =
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;

        if (!streamClosed) {
          stream.error(errorMessage);
          streamClosed = true;
        }
      } finally {
        if (!streamClosed) {
          stream.done();
        }
      }
    })();

    return { value: stream.value };
  }

  private createEvaluationPrompt(
    content: string,
    context?: INoteEvaluationRequest["context"],
  ): string {
    const contextualInfo = this.buildContextualInfo(context);
    const hasContext = contextualInfo.trim().length > 0;

    return `You are an educational assistant evaluating a student's learning note. ${hasContext ? "Use the provided context to better understand the subject matter and provide more accurate feedback." : ""}

## Note to Evaluate:
"${content}"

${contextualInfo}

## Evaluation Instructions:
Analyze this note considering:
1. **Accuracy**: Are the facts and concepts correct?
2. **Comprehension**: Does the note demonstrate understanding of key concepts?
3. **Completeness**: Are important details missing or incomplete?
4. **Clarity**: Is the information well-organized and clearly expressed?
5. **Learning Value**: How effective is this note for studying and retention?

${hasContext ? "6. **Contextual Relevance**: How well does the note capture the key points from the source material?" : ""}

## Required Response Format (JSON):
{
  "summary": "2-3 sentence overall assessment of the note's quality and understanding level",
  "correct_points": ["Specific correct concepts, facts, or insights well-captured"],
  "incorrect_points": ["Any inaccuracies, misconceptions, or unclear statements"],
  "improvement_suggestions": ["Actionable recommendations to enhance the note"],
  "overall_score": number (1-10 scale: 1-3 Poor, 4-6 Fair, 7-8 Good, 9-10 Excellent),
  "detailed_analysis": "Comprehensive breakdown of strengths, weaknesses, and educational value"
}

Provide constructive, specific feedback that helps the student improve their note-taking and understanding.`;
  }

  private buildContextualInfo(
    context?: INoteEvaluationRequest["context"],
  ): string {
    if (!context) return "";

    const contextParts: string[] = [];

    // Handle video title with null check
    if (context.videoTitle && context.videoTitle.trim()) {
      contextParts.push(`**Video Title**: "${context.videoTitle}"`);
    }

    // Handle video description with null check
    if (context.videoDescription && context.videoDescription.trim()) {
      contextParts.push(`**Video Description**: "${context.videoDescription}"`);
    }

    // Handle timestamp with null check
    if (
      context.timestamp !== null &&
      context.timestamp !== undefined &&
      context.timestamp >= 0
    ) {
      contextParts.push(
        `**Note Timestamp**: ${this.formatTimestamp(context.timestamp)}`,
      );
    }

    // Return formatted context or empty string
    if (contextParts.length === 0) return "";

    return `\n## Context Information:\n${contextParts.join("\n")}\n`;
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num: number) =>
      num
        .toString()
        .padStart(AI_FORMAT.TIMESTAMP_PADDING, AI_FORMAT.TIMESTAMP_PAD_CHAR);

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }

    return `${minutes}:${pad(secs)}`;
  }

  formatFeedbackForCopy(
    feedback: IFeedback,
    format: "plain" | "markdown",
  ): string {
    return format === AI_FORMAT.COPY_FORMATS.MARKDOWN
      ? this.formatAsMarkdown(feedback)
      : this.formatAsPlainText(feedback);
  }

  private formatAsMarkdown(feedback: IFeedback): string {
    return `# AI Evaluation Feedback

## Summary
${feedback.summary}

## Overall Score: ${feedback.overall_score}/10

## ✅ Correct Points
${this.formatListItems(feedback.correct_points, "-")}

## ❌ Points to Review
${this.formatListItems(feedback.incorrect_points, "-")}

## 💡 Improvement Suggestions
${this.formatListItems(feedback.improvement_suggestions, "-")}

## Detailed Analysis
${feedback.detailed_analysis}`;
  }

  private formatAsPlainText(feedback: IFeedback): string {
    return `AI Evaluation Feedback

Summary: ${feedback.summary}

Overall Score: ${feedback.overall_score}/10

Correct Points:
${this.formatListItems(feedback.correct_points, "•")}

Points to Review:
${this.formatListItems(feedback.incorrect_points, "•")}

Improvement Suggestions:
${this.formatListItems(feedback.improvement_suggestions, "•")}

Detailed Analysis:
${feedback.detailed_analysis}`;
  }

  private formatListItems(items: string[], bullet: string): string {
    return items.map((item) => `${bullet} ${item}`).join("\n");
  }

  private parseFeedbackFromResponse(responseText: string): IFeedback {
    try {
      let cleanedText = responseText.trim();

      if (cleanedText.startsWith(AI_QUIZZ_CONFIG.MARKDOWN_JSON_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZZ_CONFIG.MARKDOWN_JSON_START}\\s*`),
          "",
        );
      }
      if (cleanedText.startsWith(AI_QUIZZ_CONFIG.MARKDOWN_CODE_START)) {
        cleanedText = cleanedText.replace(
          new RegExp(`^${AI_QUIZZ_CONFIG.MARKDOWN_CODE_START}\\s*`),
          "",
        );
      }
      if (cleanedText.endsWith(AI_QUIZZ_CONFIG.MARKDOWN_CODE_END)) {
        cleanedText = cleanedText.replace(
          new RegExp(`\\s*${AI_QUIZZ_CONFIG.MARKDOWN_CODE_END}$`),
          "",
        );
      }

      const jsonMatch = cleanedText.match(
        new RegExp(AI_QUIZZ_CONFIG.JSON_REGEX_PATTERN),
      );
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanedText) as IFeedback;

      if (!parsed.summary || typeof parsed.overall_score !== "number") {
        throw new Error("Invalid feedback format: missing required fields");
      }

      return {
        summary: parsed.summary || "",
        correct_points: Array.isArray(parsed.correct_points)
          ? parsed.correct_points
          : [],
        incorrect_points: Array.isArray(parsed.incorrect_points)
          ? parsed.incorrect_points
          : [],
        improvement_suggestions: Array.isArray(parsed.improvement_suggestions)
          ? parsed.improvement_suggestions
          : [],
        overall_score: parsed.overall_score || 0,
        detailed_analysis: parsed.detailed_analysis || "",
      };
    } catch (error) {
      console.error(error);
      throw new Error(EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE);
    }
  }
}

export const noteService = new NoteService();
