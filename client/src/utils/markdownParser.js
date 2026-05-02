/**
 * Formats WhatsApp markdown text to HTML.
 * WhatsApp supports:
 * *bold* -> <b>bold</b>
 * _italic_ -> <i>italic</i>
 * ~strikethrough~ -> <strike>strikethrough</strike>
 * 
 * @param {string} text - The raw text with WhatsApp markdown.
 * @returns {string} - The formatted HTML string.
 */
export const formatWhatsAppMarkdown = (text = '') => {
  if (!text) return '';
  
  let formatted = String(text);
  
  // WhatsApp bold: *text* - properly handle spaces and formatting
  formatted = formatted.replace(/\*([^*]+)\*/g, '<b>$1</b>');
  
  // WhatsApp italic: _text_ - properly handle spaces and formatting
  formatted = formatted.replace(/_([^_]+)_/g, '<i>$1</i>');
  
  // WhatsApp strikethrough: ~text~ - properly handle spaces and formatting
  formatted = formatted.replace(/~([^~]+)~/g, '<strike>$1</strike>');
  
  // Handle newlines
  formatted = formatted.replace(/\n/g, '<br />');
    
  return formatted;
};
