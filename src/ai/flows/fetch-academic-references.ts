'use server';

/**
 * @fileOverview This file defines a Genkit flow for fetching academic references for a given text.
 *
 * - `fetchAcademicReferences`: The main function to fetch academic references.
 * - `FetchAcademicReferencesInput`: The input type for the `fetchAcademicReferences` function.
 * - `FetchAcademicReferencesOutput`: The output type for the `fetchAcademicReferences` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchAcademicReferencesInputSchema = z.object({
  text: z.string().describe('The text to find academic references for.'),
});
export type FetchAcademicReferencesInput = z.infer<typeof FetchAcademicReferencesInputSchema>;

const FetchAcademicReferencesOutputSchema = z.object({
  references: z
    .array(z.string())
    .describe('A list of academic references found for the text.'),
});
export type FetchAcademicReferencesOutput = z.infer<typeof FetchAcademicReferencesOutputSchema>;

export async function fetchAcademicReferences(
  input: FetchAcademicReferencesInput
): Promise<FetchAcademicReferencesOutput> {
  return fetchAcademicReferencesFlow(input);
}

const fetchAcademicReferencesPrompt = ai.definePrompt({
  name: 'fetchAcademicReferencesPrompt',
  input: {schema: FetchAcademicReferencesInputSchema},
  output: {schema: FetchAcademicReferencesOutputSchema},
  prompt: `You are an AI assistant that fetches academic references for a given text.

  Given the following text, find academic references that support the claims made in the text.

  Text: {{{text}}}

  References:`,
});

const fetchAcademicReferencesFlow = ai.defineFlow(
  {
    name: 'fetchAcademicReferencesFlow',
    inputSchema: FetchAcademicReferencesInputSchema,
    outputSchema: FetchAcademicReferencesOutputSchema,
  },
  async input => {
    const {output} = await fetchAcademicReferencesPrompt(input);
    return output!;
  }
);
