"use client";

import { usePomodoroStore } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Timer, RotateCcw, Clock, Coffee, Repeat } from "lucide-react";

export const PomodoroSettings = () => {
  const { settings, updateSettings, resetAll } = usePomodoroStore();

  const handleNumberChange = (field: keyof typeof settings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateSettings({ [field]: numValue });
    }
  };

  const handleBooleanChange = (
    field: keyof typeof settings,
    value: boolean,
  ) => {
    updateSettings({ [field]: value });
  };

  const resetToDefaults = () => {
    updateSettings({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      enableSounds: true,
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Pomodoro Settings
        </CardTitle>
        <CardDescription>Customize your focus session and break durations</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Durations - Responsive Grid Layout */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timer Durations (minutes)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Work Duration */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <Label className="text-sm">Focus</Label>
              </div>
              <div className="bg-neutral-dust rounded-md px-3 py-2 text-center">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => handleNumberChange('workDuration', e.target.value)}
                  className="border-0 bg-transparent text-center font-medium p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Short Break */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <Label className="text-sm">Short Break</Label>
              </div>
              <div className="bg-neutral-dust rounded-md px-3 py-2 text-center">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => handleNumberChange('shortBreakDuration', e.target.value)}
                  className="border-0 bg-transparent text-center font-medium p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Long Break */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <Label className="text-sm">Long Break</Label>
              </div>
              <div className="bg-neutral-dust rounded-md px-3 py-2 text-center">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => handleNumberChange('longBreakDuration', e.target.value)}
                  className="border-0 bg-transparent text-center font-medium p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Automation & Intervals - Responsive Layout */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Automation & Intervals
          </h4>

          {/* Long Break Interval */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Label className="text-sm">Long break after</Label>
              <div className="bg-neutral-dust rounded-md px-3 py-2 min-w-[60px] text-center">
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={(e) => handleNumberChange('longBreakInterval', e.target.value)}
                  className="border-0 bg-transparent text-center font-medium p-0 h-auto focus-visible:ring-0"
                />
              </div>
              <span className="text-sm text-muted-foreground">sessions</span>
            </div>

            {/* Auto Start Options */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => handleBooleanChange('autoStartBreaks', checked)}
                />
                <Label className="text-sm">Auto breaks</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.autoStartPomodoros}
                  onCheckedChange={(checked) => handleBooleanChange('autoStartPomodoros', checked)}
                />
                <Label className="text-sm">Auto sessions</Label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions - Responsive Layout */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enableSounds}
              onCheckedChange={(checked) => handleBooleanChange('enableSounds', checked)}
            />
            <Label className="text-sm">Enable sounds</Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="bg-neutral-mist hover:bg-neutral-mist/80 border-neutral-mist text-neutral-mist-foreground hover:text-neutral-mist-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
            <Button
              onClick={resetAll}
              variant="destructive"
              size="sm"
              className="bg-neutral-clay hover:bg-neutral-clay/80 text-neutral-clay-foreground"
            >
              Reset All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
