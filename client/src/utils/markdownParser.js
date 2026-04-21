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
  
  // WhatsApp bold: *text*
  // Using a more permissive regex for the preview to satisfy user visual requirements
  formatted = formatted.replace(/\*([\s\S]+?)\*/g, '<b>$1</b>');
  
  // WhatsApp italic: _text_
  formatted = formatted.replace(/_([\s\S]+?)\_/g, '<i>$1</i>');
  
  // WhatsApp strikethrough: ~text~
  formatted = formatted.replace(/~([\s\S]+?)\~/g, '<strike>$1</strike>');
  
  // Handle newlines
  formatted = formatted.replace(/\n/g, '<br />');
    
  return formatted;
};
