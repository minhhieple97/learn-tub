import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/routes";
import { tabValues } from "../search-params";
import { IVideoPageData } from "../types";
import { useNotesStore } from "@/features/notes/store";

export const VideoPageHeader = () => {
  const { currentVideo } = useNotesStore();
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`${routes.learn}?tab=${tabValues.library}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{currentVideo?.title}</h1>
        {currentVideo?.courses && (
          <p className="text-muted-foreground">
            Course: {currentVideo.courses.title}
          </p>
        )}
      </div>
    </div>
  );
};
