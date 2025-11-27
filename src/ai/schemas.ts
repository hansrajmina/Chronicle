import { z } from 'zod';

export const WritingStyleSchema = z.enum(['Formal', 'Casual', 'Modern']);
export type WritingStyle = z.infer<typeof WritingStyleSchema>;
