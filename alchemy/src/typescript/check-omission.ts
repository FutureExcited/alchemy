import { type } from "arktype";
import { generateObject } from "../agent/ai";
import { arkSchema } from "../agent/ark";
import { resolveModel } from "../agent/model";

const CodeOmissionCheck = type({
  hasOmittedCode: "boolean",
  explanation: "string",
});

const haiku = await resolveModel("claude-3-5-haiku-latest");

export async function checkForCodeOmission(code: string): Promise<boolean> {
  const result = await generateObject({
    model: haiku,
    schema: arkSchema(CodeOmissionCheck),
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are checking for signs of code omission in TypeScript code. Look for comments that indicate abbreviated or omitted content.",
      },
      {
        role: "user",
        content: `Check this code for any signs of content being lazily omitted:

\`\`\`typescript
${code}
\`\`\`

Look for patterns like:
- "// rest of the ..."
- "// remaining code ..."
- "// ... existing code ..."
- "// other methods ..."
- "// etc ..."
- "// Implementation would go here"
- "// For now just ..."
- Any similar comments that indicate code was abbreviated

Only answer true if you find such comments indicating omitted content. Otherwise answer false.`,
      },
    ],
  });

  return result.object.hasOmittedCode;
}
