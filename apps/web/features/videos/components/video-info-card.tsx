import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotesStore } from "@/features/notes/store";

export const VideoInfoCard = () => {
  const { currentVideo } = useNotesStore();
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Video Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {currentVideo?.description || "No description available."}
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Channel: {currentVideo?.channel_name || "Unknown"}</p>
          <p>
            Published:{" "}
            {currentVideo?.published_at
              ? new Date(currentVideo.published_at).toLocaleDateString()
              : "Publication date unknown"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
