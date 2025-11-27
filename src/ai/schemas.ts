import { z } from 'zod';

export const WritingStyleSchema = z.enum(['Formal', 'Casual', 'Modern']);
export type WritingStyle = z.infer<typeof WritingStyleSchema>;

export const TranslateLanguageSchema = z.enum(['Hindi', 'Tamil', 'Bengali', 'Telugu', 'Marathi', 'Urdu']);
export type TranslateLanguage = z.infer<typeof TranslateLanguageSchema>;
