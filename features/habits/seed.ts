import type { Habit } from "./types";
import { createHabit } from "./utils";

export function seedHabits(): Habit[] {
  return [
    createHabit("Drink 2L of water", "good"),
    createHabit("Stretch for 10 minutes", "good"),
    createHabit("No soda today", "bad"),
    createHabit("No doomscrolling after 10pm", "bad"),
  ];
}
