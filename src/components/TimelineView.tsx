"use client";

import { Timeline } from "./Timeline";
import { ShareToggle } from "./ShareToggle";
import type { Task, Timeline as TimelineType } from "@/lib/types";

interface TimelineViewProps {
  timeline: TimelineType;
  tasks: Task[];
}

export function TimelineView({ timeline, tasks }: TimelineViewProps) {
  return (
    <div style={{ height: "calc(100vh - 52px)", overflow: "hidden" }}>
      <Timeline
        tasks={tasks}
        timelineName={timeline.name}
        shareToggle={<ShareToggle timeline={timeline} />}
      />
    </div>
  );
}
