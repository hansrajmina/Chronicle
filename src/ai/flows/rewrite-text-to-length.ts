'use server';

/**
 * @fileOverview An AI agent that rewrites text to a specific word count.
 *
 * - rewriteTextToLength - A function that handles the text rewriting process.
 * - RewriteTextToLengthInput - The input type for the rewriteTextToLength function.
 * - RewriteTextToLengthOutput - The return type for the rewriteTextToLength function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RewriteTextToLengthInputSchema = z.object({
  text: z.string().describe('The text to rewrite.'),
  length: z.number().describe('The target word count for the rewritten text.'),
});
export type RewriteTextToLengthInput = z.infer<typeof RewriteTextToLengthInputSchema>;

const RewriteTextToLengthOutputSchema = z.object({
  rewrittenText: z.string().describe('The rewritten text.'),
});
export type RewriteTextToLengthOutput = z.infer<typeof RewriteTextToLengthOutputSchema>;

export async function rewriteTextToLength(input: RewriteTextToLengthInput): Promise<RewriteTextToLengthOutput> {
  return rewriteTextToLengthFlow(input);
}

const rewriteTextToLengthPrompt = ai.definePrompt({
  name: 'rewriteTextToLengthPrompt',
  input: {schema: RewriteTextToLengthInputSchema},
  output: {schema: RewriteTextToLengthOutputSchema},
  prompt: `Rewrite the following text to be exactly {{length}} words long.

{{{text}}}`,
});

const rewriteTextToLengthFlow = ai.defineFlow(
  {
    name: 'rewriteTextToLengthFlow',
    inputSchema: RewriteTextToLengthInputSchema,
    outputSchema: RewriteTextToLengthOutputSchema,
  },
  async input => {
    const {output} = await rewriteTextToLengthPrompt(input);
    return output!;
  }
);
