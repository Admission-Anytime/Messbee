const fs = require('fs');

const transcriptPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\83a3289d-5b0e-40ff-9325-39532d2ca0f4\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);

let content = '';

for (const line of lines) {
  const step = JSON.parse(line);
  if (!step.tool_calls) continue;

  for (const call of step.tool_calls) {
    if (call.name === 'write_to_file' && call.args.TargetFile.includes('AutomationBuilder.jsx')) {
      content = call.args.CodeContent;
    }
    
    if (call.name === 'replace_file_content' && call.args.TargetFile.includes('AutomationBuilder.jsx')) {
      const target = call.args.TargetContent;
      const replacement = call.args.ReplacementContent;
      if (content.includes(target)) {
        content = content.replace(target, replacement);
      }
    }
    
    if (call.name === 'multi_replace_file_content' && call.args.TargetFile.includes('AutomationBuilder.jsx')) {
      for (const chunk of call.args.ReplacementChunks) {
        const target = chunk.TargetContent;
        const replacement = chunk.ReplacementContent;
        if (content.includes(target)) {
          content = content.replace(target, replacement);
        }
      }
    }
  }
}

fs.writeFileSync('d:\\Messbee2\\messbee\\client\\src\\pages\\automation\\AutomationBuilder.jsx', content);
console.log('Reconstructed successfully!');
