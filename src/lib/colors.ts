/** Highlighter colors. Text on top of them is always dark navy. */
export const STUDENT_COLORS = [
  "#ff9cc8", // pink
  "#8dcfff", // sky
  "#ffe04d", // yellow
  "#86e3a0", // mint
  "#c9aeff", // violet
  "#ffb36b", // orange
  "#c4ee62", // lime
  "#ff9f8e", // coral
  "#74e0d6", // teal
  "#aebbff", // periwinkle
];

export function nextColor(used: string[]) {
  return STUDENT_COLORS.find((c) => !used.includes(c)) ?? STUDENT_COLORS[used.length % STUDENT_COLORS.length];
}
