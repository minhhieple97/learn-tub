import { Database } from "@/database.types";

// Base database types
export type LearningRoadmap =
  Database["public"]["Tables"]["learning_roadmaps"]["Row"];
export type LearningRoadmapInsert =
  Database["public"]["Tables"]["learning_roadmaps"]["Insert"];
export type LearningRoadmapUpdate =
  Database["public"]["Tables"]["learning_roadmaps"]["Update"];

export type RoadmapNode = Database["public"]["Tables"]["roadmap_nodes"]["Row"];
export type RoadmapNodeInsert =
  Database["public"]["Tables"]["roadmap_nodes"]["Insert"];
export type RoadmapNodeUpdate =
  Database["public"]["Tables"]["roadmap_nodes"]["Update"];

export type RoadmapNodeVideo =
  Database["public"]["Tables"]["roadmap_node_videos"]["Row"];
export type RoadmapNodeVideoInsert =
  Database["public"]["Tables"]["roadmap_node_videos"]["Insert"];

export type RoadmapProgress =
  Database["public"]["Tables"]["roadmap_progress"]["Row"];
export type RoadmapProgressInsert =
  Database["public"]["Tables"]["roadmap_progress"]["Insert"];
export type RoadmapProgressUpdate =
  Database["public"]["Tables"]["roadmap_progress"]["Update"];

export type RoadmapInteraction =
  Database["public"]["Tables"]["roadmap_interactions"]["Row"];
export type RoadmapInteractionInsert =
  Database["public"]["Tables"]["roadmap_interactions"]["Insert"];

// Enums
export type RoadmapStatus = "draft" | "active" | "completed" | "archived";
export type RoadmapNodeStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";
export type RoadmapInteractionType = "generate" | "update" | "search_videos";

// Extended types with relations
export type RoadmapWithNodes = LearningRoadmap & {
  nodes: RoadmapNodeWithVideos[];
  total_nodes?: number;
  completed_nodes?: number;
  total_duration?: number;
};

export type RoadmapNodeWithVideos = RoadmapNode & {
  videos: RoadmapNodeVideoWithDetails[];
  children?: RoadmapNodeWithVideos[];
  progress?: RoadmapProgress;
  parent_node?: RoadmapNode | null;
};

export type RoadmapNodeVideoWithDetails = RoadmapNodeVideo & {
  video: Database["public"]["Tables"]["videos"]["Row"];
};

// Input types for creating roadmaps
export type CreateRoadmapInput = {
  skill_name: string;
  title?: string;
  description?: string;
};

export type GenerateRoadmapRequest = {
  skill: string;
  userPrompt: string;
  preferences?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    timeCommitment?: "low" | "medium" | "high";
    learningStyle?: "visual" | "practical" | "theoretical";
    focusAreas?: string[];
  };
};

// YouTube integration types
export type YouTubeSearchResult = {
  videoId: string;
  title: string;
  description: string;
  channelName: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  viewCount?: number;
  relevanceScore?: number;
};

export type RoadmapGenerationResult = {
  roadmap: {
    title: string;
    description: string;
    estimatedDuration: number;
  };
  nodes: {
    title: string;
    description: string;
    level: number;
    parentIndex?: number;
    suggestedVideos: YouTubeSearchResult[];
    estimatedDuration: number;
    order: number;
  }[];
};

// Mindmap visualization types
export type MindmapNode = {
  id: string;
  label: string;
  description?: string;
  level: number;
  status: RoadmapNodeStatus;
  children: MindmapNode[];
  data: {
    nodeId: string;
    videos: {
      id: string;
      title: string;
      thumbnailUrl: string;
      duration: number;
    }[];
    progress?: {
      completed: boolean;
      timeSpent: number;
    };
  };
};

export type MindmapData = {
  root: MindmapNode;
  totalNodes: number;
  completedNodes: number;
  totalDuration: number;
  estimatedCompletion: string;
};

// Progress tracking types
export type RoadmapProgressSummary = {
  roadmapId: string;
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  pendingNodes: number;
  skippedNodes: number;
  totalTimeSpent: number;
  estimatedTimeRemaining: number;
  completionPercentage: number;
  currentLevel: number;
  nextSuggestedNode?: RoadmapNode;
};

export type NodeProgressUpdate = {
  nodeId: string;
  status: RoadmapNodeStatus;
  timeSpentMinutes?: number;
  notes?: string;
};

// API response types
export type RoadmapResponse = {
  success: boolean;
  data?: LearningRoadmap;
  error?: string;
};

export type RoadmapWithNodesResponse = {
  success: boolean;
  data?: RoadmapWithNodes;
  error?: string;
};

export type RoadmapGenerationResponse = {
  success: boolean;
  data?: RoadmapGenerationResult;
  error?: string;
};

export type MindmapDataResponse = {
  success: boolean;
  data?: MindmapData;
  error?: string;
};

// Hook return types
export type UseRoadmapReturn = {
  roadmap: RoadmapWithNodes | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type UseRoadmapListReturn = {
  roadmaps: LearningRoadmap[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type UseRoadmapGenerationReturn = {
  generateRoadmap: (request: GenerateRoadmapRequest) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  result: RoadmapGenerationResult | null;
};

export type UseRoadmapProgressReturn = {
  progress: RoadmapProgressSummary | null;
  updateProgress: (update: NodeProgressUpdate) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
};

// Component props types
export type RoadmapCardProps = {
  roadmap: LearningRoadmap;
  onSelect?: (roadmapId: string) => void;
  onDelete?: (roadmapId: string) => void;
};

export type MindmapViewProps = {
  data: MindmapData;
  onNodeClick?: (nodeId: string) => void;
  onVideoClick?: (videoId: string) => void;
  interactive?: boolean;
};

export type RoadmapGeneratorProps = {
  initialSkill?: string;
};

export type NodeProgressProps = {
  node: RoadmapNodeWithVideos;
  onStatusChange?: (nodeId: string, status: RoadmapNodeStatus) => void;
  onTimeUpdate?: (nodeId: string, timeSpent: number) => void;
};

// Form types
export type CreateRoadmapFormData = {
  skillName: string;
  title?: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeCommitment: "low" | "medium" | "high";
  learningStyle: "visual" | "practical" | "theoretical";
  focusAreas: string[];
  customPrompt?: string;
};

export type UpdateRoadmapFormData = {
  title?: string;
  description?: string;
  status?: RoadmapStatus;
};

// Utility types
export type RoadmapStatistics = {
  totalRoadmaps: number;
  activeRoadmaps: number;
  completedRoadmaps: number;
  totalNodesCompleted: number;
  totalTimeSpent: number;
  averageCompletionRate: number;
};

export type RoadmapSearchFilters = {
  status?: RoadmapStatus[];
  skill?: string;
  difficulty?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: "created_at" | "updated_at" | "progress" | "title";
  sortOrder?: "asc" | "desc";
};
