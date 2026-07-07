const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Node container background (typically the first background: 'white' after the position: 'relative')
  // Replace white backgrounds with dark node background (#333C4A)
  // And very light grays with darker gray (#252B36)
  content = content.replace(/background:\s*'white'/g, "background: '#3B4252'");
  content = content.replace(/background:\s*'#fafafa'/g, "background: '#2E3440'");
  content = content.replace(/background:\s*'#f9fafb'/g, "background: '#2E3440'");
  content = content.replace(/background:\s*'#f3f4f6'/g, "background: '#2E3440'");
  
  // Replace borders
  content = content.replace(/border:\s*'1px solid #e5e7eb'/g, "border: '1px solid #4C566A'");
  content = content.replace(/borderTop:\s*'1px solid #e5e7eb'/g, "borderTop: '1px solid #4C566A'");
  content = content.replace(/borderBottom:\s*'1px solid #e5e7eb'/g, "borderBottom: '1px solid #4C566A'");
  
  // Replace text colors
  content = content.replace(/color:\s*'#111827'/g, "color: '#ECEFF4'");
  content = content.replace(/color:\s*'#1f2937'/g, "color: '#E5E9F0'");
  content = content.replace(/color:\s*'#374151'/g, "color: '#D8DEE9'");
  content = content.replace(/color:\s*'#6b7280'/g, "color: '#9CA3AF'");
  
  // Replace handle styles
  content = content.replace(/border:\s*'2px solid #d1d5db'/g, "border: '2px solid #10B981'");
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Processed', file);
}
