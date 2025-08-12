export function createSnippet(snippetText: string) {
  return snippetText
    ? "```\n" + snippetText.replace(/`/g, "\\`") + "\n```"
    : "";
}