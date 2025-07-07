import { JSONContent } from "@tiptap/react";

export class ContentExtractor {
  static extractTextFromJSONContent(jsonContent: JSONContent | null): string {
    if (!jsonContent) return "";

    const extractText = (node: JSONContent): string => {
      let text = "";

      if (node.text) {
        text += node.text;
      }

      if (node.content && Array.isArray(node.content)) {
        for (const child of node.content) {
          const childText = extractText(child);
          if (childText) {
            text += text && childText ? ` ${childText}` : childText;
          }
        }
      }

      return text;
    };

    return extractText(jsonContent).trim();
  }

  static processContentForEvaluation(content: unknown): string {
    if (typeof content === "string") {
      return content.trim();
    }

    if (content && typeof content === "object") {
      try {
        const jsonContent = content as JSONContent;
        const extractedText = this.extractTextFromJSONContent(jsonContent);

        if (!extractedText) {
          throw new Error("No text content found in note");
        }

        return extractedText;
      } catch (error) {
        console.error("Failed to extract text from JSONContent:", error);
        throw new Error("Invalid note content format");
      }
    }

    throw new Error("Note content is empty or invalid");
  }

  static hasValidTextContent(content: unknown): boolean {
    try {
      const text = this.processContentForEvaluation(content);
      return text.length > 0;
    } catch {
      return false;
    }
  }
}
