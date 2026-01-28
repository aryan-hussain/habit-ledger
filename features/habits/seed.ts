import type { Habit } from "./types";
import { createHabit } from "./utils";

export function seedHabits(): Habit[] {
  return [
    createHabit("Drink 2L of water", "good", 14),
    createHabit("Stretch for 10 minutes", "good", 21),
    createHabit("No soda today", "bad", 30),
    createHabit("No doomscrolling after 10pm", "bad", 14),
  ];
}
