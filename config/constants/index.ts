export const YOUTUBE_API = {
  BASE_URL: 'https://www.googleapis.com/youtube/v3/videos',
  THUMBNAIL_URL: 'https://img.youtube.com/vi',
  PARTS: 'snippet,contentDetails',
} as const;

export const YOUTUBE_PATTERNS = {
  URL_REGEX:
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  DURATION_REGEX: /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
  VALID_URL_REGEX:
    /^https?:\/\/(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?][^\s]*)?$/i,
} as const;

export const VIDEO_DEFAULTS = {
  TITLE: 'Untitled Video',
  DESCRIPTION: '',
  CHANNEL_NAME: 'Unknown Channel',
  DURATION: 0,
} as const;

export const TIME_UNITS = {
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 3600,
  HOURS_PER_DAY: 24,
  DAYS_PER_MONTH: 30,
} as const;

export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MAX_QUERY_LENGTH: 32,
} as const;

export const VALIDATION_LIMITS = {
  NOTE_CONTENT_MAX_LENGTH: 1000,
  TAG_MAX_LENGTH: 100,
  MAX_TAGS_COUNT: 10,
} as const;

export const TOAST_MESSAGES = {
  VIDEO_ADDED_SUCCESS: 'Video added successfully!',
  VIDEO_EXISTS_ERROR: "You've already added this video",
  INVALID_URL_ERROR: 'Invalid YouTube URL',
  VIDEO_NOT_FOUND_ERROR: 'YouTube video not found or is private/unavailable',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  NOTE_SAVED_SUCCESS: 'Note saved successfully!',
  NOTE_UPDATED_SUCCESS: 'Note updated successfully!',
  NOTE_DELETED_SUCCESS: 'Note deleted successfully!',
  NOTE_SAVE_ERROR: 'Failed to save note. Please try again.',
  NOTE_UPDATE_ERROR: 'Failed to update note. Please try again.',
  NOTE_DELETE_ERROR: 'Failed to delete note. Please try again.',
  AUTH_ERROR: 'You must be logged in to perform this action',
  VALIDATION_NOTE_TOO_LONG: 'Note content cannot exceed 1000 characters',
  VALIDATION_TAG_TOO_LONG: 'Tag cannot exceed 100 characters',
  VALIDATION_TOO_MANY_TAGS: 'Cannot have more than 10 tags',
  VALIDATION_EMPTY_CONTENT: 'Note content cannot be empty',
} as const;

export const AI_CONFIG = {
  BASE_URL: 'https://multiappai-api.itmovnteam.com/v1',
  DEFAULT_MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 5000,
} as const;

export const AI_MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
  gemini: [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
    { value: 'gemini-2.0-pro-exp', label: 'Gemini 2.0 Pro (Experimental)' },
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  ],
} as const;

export const AI_DEFAULTS = {
  OPENAI_MODEL: 'gpt-4o-mini',
  GEMINI_MODEL: 'gemini-2.0-flash-exp',
  SERVICE_MODEL: 'gpt-4o-mini',
} as const;

export const AI_EVALUATION = {
  SCORE_EXCELLENT_THRESHOLD: 8,
  SCORE_GOOD_THRESHOLD: 6,
  FEEDBACK_COPY_SUCCESS: 'Feedback copied to clipboard',
  FEEDBACK_COPY_ERROR: 'Failed to copy feedback',
} as const;

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
} as const;

export const AI_API = {
  EVALUATE_NOTE_PATH: '/api/ai/evaluate-note',
  SSE_DATA_PREFIX: 'data: ',
  SSE_DATA_PREFIX_LENGTH: 6,
} as const;

export const AI_CHUNK_TYPES = {
  FEEDBACK: 'feedback',
  QUESTION: 'question',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export const AI_STATUS = {
  IDLE: 'idle',
  EVALUATING: 'evaluating',
  STREAMING: 'streaming',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export const AI_RESPONSE_HEADERS = {
  SSE_CONTENT_TYPE: 'text/plain; charset=utf-8',
  JSON_CONTENT_TYPE: 'application/json',
  CACHE_CONTROL: 'no-cache',
  CONNECTION: 'keep-alive',
} as const;

export const AI_HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const AI_ERROR_MESSAGES = {
  MISSING_REQUIRED_PARAMETERS: 'Missing required parameters',
  UNAUTHORIZED: 'Unauthorized',
  NOTE_NOT_FOUND: 'Note not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  FAILED_TO_EVALUATE_NOTE: 'Failed to evaluate note',
  NO_RESPONSE_BODY: 'No response body',
  UNKNOWN_ERROR: 'Unknown error',
  FAILED_TO_PARSE_CHUNK: 'Failed to parse chunk',
  FAILED_TO_PARSE_AI_FEEDBACK: 'Failed to parse AI feedback for database save',
} as const;

export const AI_DATABASE = {
  NOTES_TABLE: 'notes',
  NOTES_SELECT_FIELDS: 'content, timestamp_seconds',
} as const;

export const AI_CHAT_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
} as const;

export const AI_SYSTEM_MESSAGES = {
  EDUCATIONAL_ASSISTANT:
    'You are an expert educational assistant who provides constructive feedback on learning notes. Always respond with valid JSON matching the requested format.',
} as const;

export const AI_EVALUATION_ERRORS = {
  FAILED_TO_PARSE_RESPONSE: 'Failed to parse AI response. Please try again.',
  EVALUATION_FAILED: 'AI evaluation failed',
  UNSUPPORTED_PROVIDER: 'Unsupported provider',
} as const;

export const AI_FORMAT = {
  COPY_FORMATS: {
    PLAIN: 'plain',
    MARKDOWN: 'markdown',
  },
  TIMESTAMP_PADDING: 2,
  TIMESTAMP_PAD_CHAR: '0',
} as const;

export const AI_INTERACTION_TYPES = {
  NOTE_ANALYSIS: 'note_analysis',
  QUIZ_GENERATION: 'quiz_generation',
  STUDY_PLAN: 'study_plan',
  NOTE_FEEDBACK: 'note_feedback',
} as const;

export const AI_ACTION_ERRORS = {
  AUTHENTICATION_REQUIRED: 'Authentication required',
  VIDEO_NOT_FOUND: 'Video not found',
  NO_NOTES_FOUND: 'No notes found',
  NO_NOTES_FOR_ANALYSIS: 'No notes found for analysis',
  NO_NOTES_FOR_QUIZ: 'No notes found for quiz generation',
  NO_NOTES_FOR_STUDY_PLAN: 'No notes found for study plan generation',
  FAILED_TO_ANALYZE: 'Failed to analyze notes',
  FAILED_TO_GENERATE_QUIZ: 'Failed to generate quiz',
  FAILED_TO_GENERATE_STUDY_PLAN: 'Failed to generate study plan',
  FAILED_TO_GET_FEEDBACK: 'Failed to get feedback',
} as const;

export const AI_QUIZ_CONFIG = {
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_DIFFICULTY: 'mixed',
  DEFAULT_QUESTION_ID_PREFIX: 'question_',
  DEFAULT_TOPIC: 'General',
  DEFAULT_ANSWER: 'A',
  DEFAULT_QUIZ_DIFFICULTY: 'medium',
  MARKDOWN_JSON_START: '```json',
  MARKDOWN_CODE_START: '```',
  MARKDOWN_CODE_END: '```',
  JSON_REGEX_PATTERN: '\\{[\\s\\S]*\\}',
} as const;

export const AI_QUIZ_ERRORS = {
  FAILED_TO_GENERATE: 'Failed to generate questions',
  FAILED_TO_EVALUATE: 'Failed to evaluate quiz',
  FAILED_TO_PARSE_QUESTIONS: 'Failed to parse questions from AI response',
  FAILED_TO_PARSE_FEEDBACK: 'Failed to parse feedback from AI response',
  INVALID_RESPONSE_FORMAT: 'Invalid response format: missing questions array',
  UNSUPPORTED_PROVIDER: 'Unsupported provider',
  QUIZ_COMPLETED_FALLBACK:
    'Quiz completed. AI feedback parsing failed, showing basic results.',
  QUIZ_COMPLETED_SUCCESS: 'Quiz completed successfully.',
} as const;

export const AI_QUIZ_PROMPTS = {
  GENERATION_INTRO:
    'Please generate {count} multiple-choice questions based on the following video content:',
  GENERATION_REQUIREMENTS: `Requirements:
- {difficulty}
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include clear explanations for the correct answers
- Cover different aspects and key concepts from the video
- Questions should test understanding, not just memorization
- Include the topic/subject area for each question`,
  GENERATION_FORMAT: `Please provide your response in the following JSON format:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text here",
      "options": {
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      },
      "correctAnswer": "A|B|C|D",
      "explanation": "Detailed explanation of why this is correct",
      "topic": "Topic/subject area",
      "difficulty": "easy|medium|hard"
    }
  ]
}`,
  GENERATION_FOOTER:
    'Make sure the questions are educational, relevant, and well-structured.',
  EVALUATION_INTRO:
    'Please evaluate the following quiz results and provide detailed feedback:',
  EVALUATION_FORMAT: `Please analyze the performance and provide feedback in the following JSON format:
{
  "totalQuestions": {total},
  "correctAnswers": number,
  "score": number (0-100),
  "overallFeedback": "Comprehensive assessment of overall performance",
  "areasForImprovement": ["Specific areas that need work"],
  "strengths": ["Areas where the student performed well"],
  "performanceByTopic": {
    "topic_name": {
      "correct": number,
      "total": number,
      "percentage": number
    }
  }
}`,
  EVALUATION_FOCUS: `Focus on:
1. Overall knowledge retention
2. Understanding of key concepts
3. Areas of strength and weakness
4. Specific recommendations for improvement
5. Performance patterns by topic and difficulty

Be constructive and educational in your feedback.`,
  TOPICS_PREFIX: 'Focus on these topics: ',
  DIFFICULTY_MIXED: 'Mix of easy, medium, and hard questions',
  DIFFICULTY_SUFFIX: ' difficulty level',
  VIDEO_TITLE_PREFIX: 'Video Title: "',
  VIDEO_DESCRIPTION_PREFIX: 'Video Description: "',
  QUIZ_RESULTS_PREFIX: 'Quiz Results:',
} as const;
