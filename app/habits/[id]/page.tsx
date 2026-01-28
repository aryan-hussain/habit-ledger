"use client";

import { useParams } from "next/navigation";
import { HabitDetail } from "@/features/habits/components/HabitDetail";
import { HabitsProvider } from "@/features/habits/store";

export default function HabitDetailPage() {
  const params = useParams();
  const habitId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!habitId) {
    return null;
  }

  return (
    <HabitsProvider>
      <HabitDetail habitId={habitId} />
    </HabitsProvider>
  );
}
