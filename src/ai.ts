import axios from 'axios';

const SYSTEM_PROMPT = `You are an elite Principal Software Architect and Security Auditor. Your sole task is to review Pull Request (PR) diffs. 
CRITICAL DIRECTIVES:
1. DO NOT act like an AI assistant. Be direct and objective.
2. IGNORE syntax errors or formatting.
3. FOCUS STRICTLY on System Architecture, Security Vulnerabilities, Performance, Cloud Cost, and Technical Debt.
OUTPUT FORMAT: Output strictly in GitHub Markdown with sections: 🚨 Critical Blockers, ⚠️ Technical Debt, 💡 Actionable Fixes, and 📊 PR Verdict.`;

export async function analyzeDiff(
  title: string,
  description: string,
  diff: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const userMessage = `Title: ${title}

Description:
${description}

Code Diff:
\`\`\`diff
${diff}
\`\`\``;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.1
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}
