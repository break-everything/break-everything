import type { Tool } from "@/types";

/** Tool shape safe for unauthenticated JSON APIs (no internal moderator notes). */
export type PublicTool = Omit<Tool, "review_notes">;

export function toPublicTool(tool: Tool): PublicTool {
  const { review_notes: _unusedReviewNotes, ...rest } = tool;
  void _unusedReviewNotes;
  return rest;
}
