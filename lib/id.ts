export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `habit-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
