'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/humanize-text.ts';
import '@/ai/flows/expand-text-with-ai.ts';
import '@/ai/flows/fetch-academic-references.ts';
import '@/ai/flows/translate-to-indian-language.ts';
import '@/ai/flows/rewrite-text-to-length.ts';
import '@/ai/flows/change-writing-style.ts';
