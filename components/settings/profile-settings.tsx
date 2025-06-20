"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Camera, User } from "lucide-react";
import { useUserProfile } from "@/components/queries-client/user-profile";
import {
  useProfileSettings,
  useAvatarUpload,
} from "@/hooks/use-profile-settings";
import type { IProfileFormData } from "@/types";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name is too long"),
});

export function ProfileSettings() {
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { updateProfile, isUpdating } = useProfileSettings();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<IProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: userProfile?.user_metadata?.full_name || "",
    },
  });

  // Update form when user profile loads
  useEffect(() => {
    if (userProfile) {
      reset({
        full_name: userProfile.user_metadata?.full_name || "",
      });
      setAvatarUrl(userProfile.user_metadata?.avatar_url || null);
    }
  }, [userProfile, reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadAvatar(file);
    if (result.url) {
      setAvatarUrl(result.url);
      await updateProfile({ avatar_url: result.url });
    }
  };

  const onSubmit = async (data: IProfileFormData) => {
    await updateProfile({
      full_name: data.full_name,
      ...(avatarUrl && { avatar_url: avatarUrl }),
    });
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isProfileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your personal information and avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Unable to load profile information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your personal information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={avatarUrl || userProfile.user_metadata?.avatar_url}
                alt={
                  userProfile.user_metadata?.full_name ||
                  userProfile.email ||
                  ""
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                {getUserInitials(
                  userProfile.user_metadata?.full_name,
                  userProfile.email || "",
                )}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={handleAvatarClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div>
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a new avatar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userProfile.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed from this interface
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              placeholder="Enter your full name"
              {...register("full_name")}
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!isDirty || isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || isUpdating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
