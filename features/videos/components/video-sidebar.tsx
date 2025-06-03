import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { AIAssistant } from '@/features/ai/components/ai-assistant';

type VideoSidebarProps = {
  videoId: string;
  dbVideoId: string;
  currentTimestamp: number;
  onTimestampClick: (time: number) => void;
};

export function VideoSidebar({
  videoId,
  dbVideoId,
  currentTimestamp,
  onTimestampClick,
}: VideoSidebarProps) {
  return (
    <Tabs defaultValue="notes">
      <TabsList className="w-full">
        <TabsTrigger value="notes" className="flex-1">
          Notes
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex-1">
          AI Assistant
        </TabsTrigger>
      </TabsList>
      <TabsContent value="notes" className="mt-4">
        <NoteEditor
          videoId={videoId}
          currentTimestamp={currentTimestamp}
          onTimestampClick={onTimestampClick}
        />
      </TabsContent>
      <TabsContent value="ai" className="mt-4">
        <AIAssistant videoId={videoId} dbVideoId={dbVideoId} />
      </TabsContent>
    </Tabs>
  );
}
