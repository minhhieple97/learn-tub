import { getUserRoadmaps } from "@/features/roadmaps/queries";
import { RoadmapsPageClient } from "@/features/roadmaps/components";
import { checkProfile } from "@/lib/require-auth";

export default async function RoadmapsPage() {
  const profile = await checkProfile();
  const roadmaps = await getUserRoadmaps(profile.id);

  return <RoadmapsPageClient initialRoadmaps={roadmaps} />;
}
