'use server';

/**
 * @fileOverview This file defines a Genkit flow for humanizing text.
 *
 * The flow takes a text input and returns a humanized version of the text.
 * - humanizeText - A function that humanizes the input text.
 * - HumanizeTextInput - The input type for the humanizeText function.
 * - HumanizeTextOutput - The output type for the humanizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumanizeTextInputSchema = z.object({
  text: z.string().describe('The text to humanize.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

const HumanizeTextOutputSchema = z.object({
  humanizedText: z.string().describe('The humanized version of the text.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;

export async function humanizeText(input: HumanizeTextInput): Promise<HumanizeTextOutput> {
  return humanizeTextFlow(input);
}

const humanizeTextPrompt = ai.definePrompt({
  name: 'humanizeTextPrompt',
  input: {schema: HumanizeTextInputSchema},
  output: {schema: HumanizeTextOutputSchema},
  prompt: `Rewrite the following text to sound more natural:

{{{text}}}`,
});

const humanizeTextFlow = ai.defineFlow(
  {
    name: 'humanizeTextFlow',
    inputSchema: HumanizeTextInputSchema,
    outputSchema: HumanizeTextOutputSchema,
  },
  async input => {
    const {output} = await humanizeTextPrompt(input);
    return output!;
  }
);
