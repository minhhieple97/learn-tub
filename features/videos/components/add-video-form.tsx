"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addVideoAction } from "../actions/add-video"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AddVideoForm() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(addVideoAction, null)

  // Redirect to video page if successful
  useEffect(() => {
    if (state?.success && state.videoId) {
      router.push(`/learn/${state.videoId}`)
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add YouTube Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">YouTube URL</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Adding Video..." : "Add Video"}
          </Button>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
