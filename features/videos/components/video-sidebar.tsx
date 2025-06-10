import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteEditor } from '@/features/notes/components/note-editor';
import { QuizzTab } from '@/features/quizzes/components/quizz-tab';
import { IVideoPageData } from '../types';

type VideoSidebarProps = {
  currentTimestamp: number;
  onTimestampClick: (time: number) => void;
  video: IVideoPageData;
};

export const VideoSidebar = ({
  currentTimestamp,
  onTimestampClick,
  video,
}: VideoSidebarProps) => {
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
          video={video}
          currentTimestamp={currentTimestamp}
          onTimestampClick={onTimestampClick}
        />
      </TabsContent>
      <TabsContent value="ai" className="mt-4">
        <QuizzTab videoId={video.id} />
      </TabsContent>
    </Tabs>
  );
};
