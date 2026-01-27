import { Dashboard } from "@/features/habits/components/Dashboard";
import { HabitsProvider } from "@/features/habits/store";

export default function Home() {
  return (
    <HabitsProvider>
      <Dashboard />
    </HabitsProvider>
  );
}
