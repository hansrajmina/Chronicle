'use server';

/**
 * @fileOverview A flow to translate text into a major Indian language.
 *
 * - translateToIndianLanguage - A function that handles the translation process.
 * - TranslateToIndianLanguageInput - The input type for the translateToIndianLanguage function.
 * - TranslateToIndianLanguageOutput - The return type for the translateToIndianLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateToIndianLanguageInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  language: z
    .enum(['Hindi', 'Tamil', 'Bengali', 'Telugu', 'Marathi', 'Urdu'])
    .describe('The Indian language to translate to.'),
});
export type TranslateToIndianLanguageInput = z.infer<typeof TranslateToIndianLanguageInputSchema>;

const TranslateToIndianLanguageOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateToIndianLanguageOutput = z.infer<typeof TranslateToIndianLanguageOutputSchema>;

export async function translateToIndianLanguage(
  input: TranslateToIndianLanguageInput
): Promise<TranslateToIndianLanguageOutput> {
  return translateToIndianLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateToIndianLanguagePrompt',
  input: {schema: TranslateToIndianLanguageInputSchema},
  output: {schema: TranslateToIndianLanguageOutputSchema},
  prompt: `Translate the following text to {{language}}:\n\n{{text}}`,
});

const translateToIndianLanguageFlow = ai.defineFlow(
  {
    name: 'translateToIndianLanguageFlow',
    inputSchema: TranslateToIndianLanguageInputSchema,
    outputSchema: TranslateToIndianLanguageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
