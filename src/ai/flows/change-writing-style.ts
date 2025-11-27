
'use server';

/**
 * @fileOverview An AI agent that changes the writing style of text.
 *
 * - changeWritingStyle - A function that handles the style change process.
 * - ChangeWritingStyleInput - The input type for the changeWritingStyle function.
 * - ChangeWritingStyleOutput - The return type for the changeWritingStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { WritingStyleSchema, type WritingStyle } from '@/ai/schemas';


const ChangeWritingStyleInputSchema = z.object({
  text: z.string().describe('The text to rewrite.'),
  style: WritingStyleSchema.describe('The target writing style.'),
});
export type ChangeWritingStyleInput = z.infer<typeof ChangeWritingStyleInputSchema>;

const ChangeWritingStyleOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten text in the new style.'),
});
export type ChangeWritingStyleOutput = z.infer<typeof ChangeWritingStyleOutputSchema>;

export async function changeWritingStyle(input: ChangeWritingStyleInput): Promise<ChangeWritingStyleOutput> {
  return changeWritingStyleFlow(input);
}

const changeWritingStylePrompt = ai.definePrompt({
  name: 'changeWritingStylePrompt',
  input: {schema: ChangeWritingStyleInputSchema},
  output: {schema: ChangeWritingStyleOutputSchema},
  prompt: `Rewrite the following text in a {{style}} style.

{{{text}}}`,
});

const changeWritingStyleFlow = ai.defineFlow(
  {
    name: 'changeWritingStyleFlow',
    inputSchema: ChangeWritingStyleInputSchema,
    outputSchema: ChangeWritingStyleOutputSchema,
  },
  async input => {
    const {output} = await changeWritingStylePrompt(input);
    return output!;
  }
);
