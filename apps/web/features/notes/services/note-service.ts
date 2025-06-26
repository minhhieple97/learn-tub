import {
  AI_DEFAULTS,
  CHUNK_TYPES,
  AI_SYSTEM_MESSAGES,
  AI_FORMAT,
  ERROR_MESSAGES,
  EVALUATION_ERRORS,
  AI_QUIZZ_CONFIG,
  AI_COMMANDS,
} from "@/config/constants";
import { INoteEvaluationRequest } from "@/features/notes/types";
import { IFeedback, StreamChunk } from "@/types";
import { aiUsageTracker } from "@/features/ai";
import { AIClientFactory } from "@/features/ai/services/ai-client";
import { getAIModelName } from "../queries";

type StreamController = ReadableStreamDefaultController<StreamChunk>;

class NoteService {
  async evaluateNote(
    request: INoteEvaluationRequest,
  ): Promise<ReadableStream<StreamChunk>> {
    const { aiModelId, content, context, userId } = request;
    const prompt = this.createEvaluationPrompt(content, context);

    const { data: modelData, error: modelError } =
      await getAIModelName(aiModelId);

    if (modelError || !modelData?.model_name) {
      throw new Error(
        `${EVALUATION_ERRORS.UNSUPPORTED_PROVIDER}: ${aiModelId}`,
      );
    }

    const modelName = modelData.model_name;

    return aiUsageTracker.wrapStreamingOperation(
      {
        user_id: userId,
        command: "evaluate_note" as const,
        ai_model_id: aiModelId,
        request_payload: { prompt_length: prompt.length },
      },
      async () => {
        const aiClient = AIClientFactory.getClient();

        const messages = aiClient.createSystemUserMessages(
          AI_SYSTEM_MESSAGES.EDUCATIONAL_ASSISTANT,
          prompt,
        );

        const { stream, getUsage } =
          await aiClient.streamChatCompletionWithUsage({
            model: modelName,
            messages,
            stream_options: {
              include_usage: true,
            },
          });

        const transformedStream = this.createStreamFromAIClient(stream);

        return {
          stream: transformedStream,
          getUsage,
        };
      },
    );
  }

  private createEvaluationPrompt(
    content: string,
    context?: INoteEvaluationRequest["context"],
  ): string {
    const contextualInfo = this.buildContextualInfo(context);

    return `
Please evaluate the following learning note and provide detailed feedback:

Note Content: "${content}"
${contextualInfo}

Please provide your evaluation in the following JSON format:
{
  "summary": "Brief overall assessment of the note",
  "correct_points": ["List of correct or well-articulated points"],
  "incorrect_points": ["List of incorrect or questionable points"],
  "improvement_suggestions": ["Specific suggestions for improvement"],
  "overall_score": number (1-10),
  "detailed_analysis": "Comprehensive analysis with explanations"
}

Focus on:
1. Accuracy of information
2. Clarity of understanding
3. Completeness of key concepts
4. Areas for improvement
5. Study effectiveness

Be constructive and educational in your feedback.`;
  }

  private buildContextualInfo(
    context?: INoteEvaluationRequest["context"],
  ): string {
    if (!context) return "";

    const contextParts: string[] = [];

    if (context.videoTitle) {
      contextParts.push(`Video Title: "${context.videoTitle}"`);
    }

    if (context.videoDescription) {
      contextParts.push(`Video Context: "${context.videoDescription}"`);
    }

    if (context.timestamp) {
      contextParts.push(
        `Timestamp: ${this.formatTimestamp(context.timestamp)}`,
      );
    }

    return contextParts.join("\n");
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

  private createStreamFromAIClient(
    responseBody: ReadableStream<Uint8Array>,
  ): ReadableStream<StreamChunk> {
    const aiClient = AIClientFactory.getClient();
    const aiStream = aiClient.createStreamFromResponse(responseBody);

    return new ReadableStream<StreamChunk>({
      async start(controller) {
        try {
          let fullContent = "";
          const reader = aiStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const content = value.choices[0]?.delta?.content || "";
            fullContent += content;

            controller.enqueue({
              type: CHUNK_TYPES.FEEDBACK,
              content,
              finished: false,
            });
          }

          noteService.handleStreamCompletion(controller, fullContent);
        } catch (error) {
          noteService.handleStreamError(controller, error);
        }
      },
    });
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
      throw new Error(EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE);
    }
  }

  private handleStreamCompletion(
    controller: StreamController,
    fullContent: string,
  ): void {
    try {
      const feedback = this.parseFeedbackFromResponse(fullContent);
      controller.enqueue({
        type: CHUNK_TYPES.COMPLETE,
        content: JSON.stringify(feedback),
        finished: true,
      });
    } catch {
      controller.enqueue({
        type: CHUNK_TYPES.ERROR,
        content: EVALUATION_ERRORS.FAILED_TO_PARSE_RESPONSE,
        finished: true,
      });
    } finally {
      controller.close();
    }
  }

  private handleStreamError(
    controller: StreamController,
    error: unknown,
  ): void {
    const errorMessage =
      error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;

    controller.enqueue({
      type: CHUNK_TYPES.ERROR,
      content: `${EVALUATION_ERRORS.EVALUATION_FAILED}: ${errorMessage}`,
      finished: true,
    });

    controller.close();
  }
}

export const noteService = new NoteService();
