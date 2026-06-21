const fs = require('fs');
const path = require('path');

const logFilePath = 'C:/Users/sumit/.gemini/antigravity/brain/64ee98a6-94b4-43f1-bd9d-db5cb88d1ea7/.system_generated/logs/transcript.jsonl';
const targetFile = 'd:/Projects/art-anchal-1.0/src/components/pages/AdminConsoleView.tsx';

// 1. Read the clean file
let content = fs.readFileSync(targetFile, 'utf8');

// 2. Read logs line by line
const logs = fs.readFileSync(logFilePath, 'utf8').split('\n');

console.log('Starting reconstruction...');

let editCount = 0;

for (let i = 0; i < logs.length; i++) {
  const lineStr = logs[i].trim();
  if (!lineStr) continue;
  
  let step;
  try {
    step = JSON.parse(lineStr);
  } catch (e) {
    continue;
  }
  
  if (step.type !== 'PLANNER_RESPONSE') continue;
  if (!step.tool_calls) continue;
  
  for (const tc of step.tool_calls) {
    if (tc.name === 'multi_replace_file_content' || tc.name === 'replace_file_content') {
      const args = tc.args;
      const fileArg = args.TargetFile || args.targetFile || '';
      if (fileArg.includes('AdminConsoleView.tsx')) {
        console.log(`\n--- Step ${step.step_index} (${tc.name}) ---`);
        editCount++;
        
        let chunks = [];
        if (tc.name === 'multi_replace_file_content') {
          // ReplacementChunks can be a stringified JSON or a JSON object
          let rawChunks = args.ReplacementChunks || args.replacementChunks;
          if (typeof rawChunks === 'string') {
            chunks = JSON.parse(rawChunks);
          } else {
            chunks = rawChunks;
          }
        } else {
          chunks = [{
            TargetContent: args.TargetContent || args.targetContent,
            ReplacementContent: args.ReplacementContent || args.replacementContent
          }];
        }
        
        // Apply chunks
        for (const chunk of chunks) {
          const target = chunk.TargetContent;
          const replacement = chunk.ReplacementContent;
          
          if (!content.includes(target)) {
            console.error(`ERROR: Target content not found in step ${step.step_index}!`);
            console.error('Target snippet (first 100 chars):', target.substring(0, 100));
            // Let's print clean version preview around where it should be
            process.exit(1);
          }
          
          content = content.replace(target, replacement);
          console.log('Applied replacement successfully.');
        }
      }
    }
  }
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`Reconstruction complete. Applied ${editCount} tool call edits successfully.`);
