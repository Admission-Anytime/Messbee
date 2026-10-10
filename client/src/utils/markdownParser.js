/**
 * Converts rich editor HTML (divs, brs, b, i, strike, code) to WhatsApp Markdown syntax.
 * 
 * @param {string} html - HTML string from contentEditable editor
 * @returns {string} - Clean WhatsApp markdown formatted string
 */
export const htmlToWhatsAppMarkdown = (html = '') => {
  if (!html) return '';
  let str = String(html);

  // Convert line breaks and paragraph/div closing tags to newlines
  str = str.replace(/<br\s*\/?>/gi, '\n');
  str = str.replace(/<\/div>/gi, '\n');
  str = str.replace(/<\/p>/gi, '\n');
  str = str.replace(/<div>/gi, '');
  str = str.replace(/<p>/gi, '');

  // Convert rich text formatting tags to WhatsApp markdown markers
  str = str.replace(/<(?:b|strong)[^>]*>(.*?)<\/(?:b|strong)>/gi, '*$1*');
  str = str.replace(/<(?:i|em)[^>]*>(.*?)<\/(?:i|em)>/gi, '_$1_');
  str = str.replace(/<(?:strike|s|del)[^>]*>(.*?)<\/(?:strike|s|del)>/gi, '~$1~');
  str = str.replace(/<code[^>]*>(.*?)<\/code>/gi, '```$1```');

  // Strip any remaining unexpected HTML tags
  str = str.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  str = str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return str;
};

/**
 * Formats WhatsApp markdown text to HTML for preview and chat rendering.
 * Supports:
 * *bold* -> <b>bold</b>
 * _italic_ -> <i>italic</i>
 * ~strikethrough~ -> <strike>strikethrough</strike>
 * ```code``` -> <code>code</code>
 * {{1}} -> Dynamic variable sample replacement or highlighted badge
 * 
 * @param {string} text - The raw text (WhatsApp markdown or rich editor HTML).
 * @param {object|null} samples - Optional sample variable dictionary ({ "1": "Rahul" }).
 * @returns {string} - The formatted HTML string.
 */
export const formatWhatsAppMarkdown = (text = '', samples = null) => {
  if (!text) return '';
  
  let formatted = String(text);

  // If input contains HTML tags (e.g. from contentEditable rich editor), normalize to markdown first
  if (/<[a-z\d]+(?:\s+[^>]*)?>|<\/[a-z\d]+>/i.test(formatted)) {
    formatted = htmlToWhatsAppMarkdown(formatted);
  }
  
  // Safe escape of special HTML chars before inserting formatting HTML
  formatted = formatted
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // WhatsApp monospace: ```text```
  formatted = formatted.replace(/```([^`]+)```/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>');

  // WhatsApp bold: *text*
  formatted = formatted.replace(/\*([^*]+)\*/g, '<b>$1</b>');
  
  // WhatsApp italic: _text_
  formatted = formatted.replace(/_([^_]+)_/g, '<i>$1</i>');
  
  // WhatsApp strikethrough: ~text~
  formatted = formatted.replace(/~([^~]+)~/g, '<strike>$1</strike>');

  // Variable sample values substitution if samples provided
  if (samples && typeof samples === 'object') {
    formatted = formatted.replace(/\{\{\s*(\d+)\s*\}\}/g, (match, num) => {
      const sampleVal = samples[num] ?? samples[String(num)];
      if (sampleVal && String(sampleVal).trim()) {
        return `<span style="background-color: #dcfce7; color: #166534; font-weight: 600; padding: 1px 4px; border-radius: 4px; border: 1px solid #bbf7d0;">${String(sampleVal).trim()}</span>`;
      }
      return `<span style="background-color: #f1f5f9; color: #475569; font-family: monospace; font-size: 8.5px; font-weight: 600; padding: 1px 4px; border-radius: 4px; border: 1px solid #e2e8f0;">{{${num}}}</span>`;
    });
  }
  
  // Handle newlines
  formatted = formatted.replace(/\n/g, '<br />');
    
  return formatted;
};
