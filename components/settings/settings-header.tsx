import { Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="h-8 w-8 text-foreground" />
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your account preferences, profile information, and subscription
        settings
      </p>
    </div>
  );
}
