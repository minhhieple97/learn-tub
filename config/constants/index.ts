export const YOUTUBE_API = {
  BASE_URL: 'https://www.googleapis.com/youtube/v3/videos',
  THUMBNAIL_URL: 'https://img.youtube.com/vi',
  PARTS: 'snippet,contentDetails',
} as const;

export const YOUTUBE_PATTERNS = {
  URL_REGEX: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
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
  FEEDBACK_COPY_SUCCESS: 'Feedback copied to clipboard',
  FEEDBACK_COPY_ERROR: 'Failed to copy feedback',
} as const;

export const AI_CONFIG = {
  BASE_URL: 'https://multiappai-api.itmovnteam.com/v1',
  DEFAULT_MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 5000,
} as const;

export const AI_MODELS = [
  { value: 'gemini-2.5-flash-preview', label: 'Gemini 2.5 Flash (Experimental)' },
  { value: 'gemini-2.0-pro-exp', label: 'Gemini 2.0 Pro (Experimental)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
] as const;

export const AI_DEFAULTS = {
  DEFAULT_MODEL: 'gpt-4o-mini',
} as const;

export const AI_EVALUATION = {
  SCORE_EXCELLENT_THRESHOLD: 8,
  SCORE_GOOD_THRESHOLD: 6,
} as const;

export const AI_COMMANDS = {
  EVALUATE_NOTE: 'evaluate_note',
  GENERATE_QUIZZ_QUESTIONS: 'generate_quizz_questions',
  EVALUATE_QUIZZ_ANSWERS: 'evaluate_quizz_answers',
  CHAT_COMPLETION: 'chat_completion',
  TEXT_GENERATION: 'text_generation',
} as const;

export const AI_API = {
  EVALUATE_NOTE_PATH: '/api/evaluate-note',
  CHAT_COMPLETIONS_PATH: '/chat/completions',

  SSE_DATA_PREFIX: 'data: ',
  SSE_DATA_PREFIX_LENGTH: 6,
  SSE_DONE_MESSAGE: '[DONE]',
} as const;

export const HTTP_CONFIG = {
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION_PREFIX: 'Bearer ',
  },
  METHODS: {
    POST: 'POST',
  },
} as const;

export const CHUNK_TYPES = {
  FEEDBACK: 'feedback',
  QUESTION: 'question',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export const RESPONSE_HEADERS = {
  SSE_CONTENT_TYPE: 'text/plain; charset=utf-8',
  JSON_CONTENT_TYPE: 'application/json',
  CACHE_CONTROL: 'no-cache',
  CONNECTION: 'keep-alive',
} as const;

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
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

export const API_ERROR_MESSAGES = {
  OPENAI_REQUEST_FAILED: 'OpenAI API request failed',
  GEMINI_REQUEST_FAILED: 'Gemini API request failed',
  NO_RESPONSE_BODY_OPENAI: 'No response body from OpenAI API',
  NO_RESPONSE_BODY_GEMINI: 'No response body from Gemini API',
} as const;

export const AI_CHAT_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
} as const;

export const AI_SYSTEM_MESSAGES = {
  EDUCATIONAL_ASSISTANT:
    'You are an expert educational assistant who provides constructive feedback on learning notes. Always respond with valid JSON matching the requested format.',
} as const;

export const EVALUATION_ERRORS = {
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

export const AI_QUIZZ_CONFIG = {
  DEFAULT_QUESTION_COUNT: 10,
  DEFAULT_DIFFICULTY: 'mixed',
  DEFAULT_QUESTION_ID_PREFIX: 'question_',
  DEFAULT_TOPIC: 'General',
  DEFAULT_ANSWER: 'A',
  DEFAULT_QUIZZ_DIFFICULTY: 'medium',
  MARKDOWN_JSON_START: '```json',
  MARKDOWN_CODE_START: '```',
  MARKDOWN_CODE_END: '```',
  JSON_REGEX_PATTERN: '\\{[\\s\\S]*\\}',
} as const;

export const AI_QUIZZ_ERRORS = {
  FAILED_TO_GENERATE: 'Failed to generate questions',
  FAILED_TO_EVALUATE: 'Failed to evaluate quiz',
  FAILED_TO_PARSE_QUESTIONS: 'Failed to parse questions from AI response',
  FAILED_TO_PARSE_FEEDBACK: 'Failed to parse feedback from AI response',
  INVALID_RESPONSE_FORMAT: 'Invalid response format: missing questions array',
  UNSUPPORTED_PROVIDER: 'Unsupported provider',
  QUIZZ_COMPLETED_FALLBACK: 'Quiz completed. AI feedback parsing failed, showing basic results.',
  QUIZZ_COMPLETED_SUCCESS: 'Quiz completed successfully.',
} as const;

export const AI_QUIZZ_PROMPTS = {
  GENERATION_INTRO:
    'Please generate {count} multiple-choice questions based on the following video content:',
  GENERATION_REQUIREMENTS: `Requirements:
- {difficulty}
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include clear explanations for the correct answers
- Cover different aspects and key concepts from the video
- Questions should test understanding, not just memorization
- Include the topic/subject area for each question
- If learning objectives are provided, tailor questions to focus on those specific goals`,
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
  GENERATION_FOOTER: 'Make sure the questions are educational, relevant, and well-structured.',
  EVALUATION_INTRO: 'Please evaluate the following quiz results and provide detailed feedback:',
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
- Overall understanding level
- Strengths and areas for improvement
- Specific recommendations for further learning
- Topic-based performance analysis`,
  QUIZZ_RESULTS_PREFIX: 'Quiz Results:',
  TOPICS_PREFIX: 'Focus on these topics: ',
  DIFFICULTY_MIXED: 'Mix of easy, medium, and hard questions',
  DIFFICULTY_SUFFIX: ' level questions',
  VIDEO_TITLE_PREFIX: 'Video Title: "',
  VIDEO_DESCRIPTION_PREFIX: 'Video Description: "',
  VIDEO_TUTORIAL_PREFIX: 'Learning Objective: "',
} as const;

export const STATUS_STREAMING = {
  IDLE: 'idle',
  EVALUATING: 'evaluating',
  STREAMING: 'streaming',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export const QUIZZ_DASHBOARD_CONFIG = {
  SEARCH_DEBOUNCE_DELAY: 500,
  PAGINATION_LIMIT: 10,
  DEFAULT_PAGE: 1,
} as const;

export const QUIZZ_FILTER_DEFAULTS = {
  SEARCH: '',
  DIFFICULTY: 'all',
  VIDEO_ID: '',
  SORT_BY: 'created_at',
  SORT_ORDER: 'desc',
} as const;

export const QUIZZ_FILTER_VALUES = {
  ALL: 'all',
  DIFFICULTIES: {
    ALL: 'all',
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    MIXED: 'mixed',
  },
  SORT_OPTIONS: {
    CREATED_AT: 'created_at',
    SCORE: 'score',
    ATTEMPTS: 'attempts',
  },
  SORT_ORDERS: {
    ASC: 'asc',
    DESC: 'desc',
  },
} as const;
