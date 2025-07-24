export function formatCustomText(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .replace(/#\*\*(.*?)\*\*#/g, '<strong style="color: red;">$1</strong>') // #**texto**# -> <strong style="color: red;">texto</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **texto** -> <strong>texto</strong>
    .replace(/\*(.*?)\*/g, '<em style="color: orange;">$1</em>')     // *texto* -> <em style="color: orange;">texto</em>
    .replace(/\n/g, '<br />'); // quebras de linha
} 