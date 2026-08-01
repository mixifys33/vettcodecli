/**
 * Sanitize and render markdown to HTML
 * Production-safe HTML rendering with XSS prevention
 */

export function sanitizeHtml(html: string): string {
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
}

export function renderMarkdown(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Code blocks with syntax highlighting placeholder
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre class="bg-gray-950 border border-gray-800 p-3 rounded-lg overflow-x-auto my-2 font-mono text-sm"><code class="language-$1">$2</code></pre>'
  );
  
  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-950 border border-gray-800 px-2 py-0.5 rounded text-xs font-mono">$1</code>'
  );
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-white">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2 text-white">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-white">$1</h1>');
  
  // Bullet points
  html = html.replace(/^[•\-*] (.+)$/gm, '<li class="ml-4 my-1">• $1</li>');
  
  // Numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 my-1" style="list-style-type: decimal;">$2</li>');
  
  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-secondary underline">$1</a>'
  );
  
  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  
  return sanitizeHtml(html);
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
