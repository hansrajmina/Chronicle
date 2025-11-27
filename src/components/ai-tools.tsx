'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { rewriteTextToLength } from '@/ai/flows/rewrite-text-to-length';
import { changeWritingStyle } from '@/ai/flows/change-writing-style';
import { humanizeText } from '@/ai/flows/humanize-text';
import { expandTextWithAI } from '@/ai/flows/expand-text-with-ai';
import { translateToIndianLanguage } from '@/ai/flows/translate-to-indian-language';

type AIToolsProps = {
  activeTab: string | null;
  state: {
    selectedText: string;
    editorContent: string;
  };
  dispatch: React.Dispatch<any>;
};

const RewriteSchema = z.object({
  length: z.number().min(10).max(1000),
});

const StyleSchema = z.object({
  style: z.enum(['Formal', 'Casual', 'Modern']),
});

const TranslateSchema = z.object({
  language: z.enum(['Hindi', 'Tamil', 'Bengali', 'Telugu', 'Marathi', 'Urdu']),
});

export default function AITools({ activeTab, state, dispatch }: AIToolsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const rewriteForm = useForm<z.infer<typeof RewriteSchema>>({
    resolver: zodResolver(RewriteSchema),
    defaultValues: { length: 100 },
  });

  const styleForm = useForm<z.infer<typeof StyleSchema>>({
    resolver: zodResolver(StyleSchema),
    defaultValues: { style: 'Formal' },
  });

  const translateForm = useForm<z.infer<typeof TranslateSchema>>({
    resolver: zodResolver(TranslateSchema),
    defaultValues: { language: 'Hindi' },
  });

  const handleAIResponse = (text: string, original: string) => {
    const newContent = state.editorContent.replace(original, text);
    dispatch({ type: 'SET_EDITOR_CONTENT', payload: newContent });
  };

  const onRewriteSubmit = async (data: z.infer<typeof RewriteSchema>) => {
    setIsLoading(true);
    try {
      const result = await rewriteTextToLength({ text: state.selectedText, length: data.length });
      handleAIResponse(result.rewrittenText, state.selectedText);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to rewrite text.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onStyleSubmit = async (data: z.infer<typeof StyleSchema>) => {
    setIsLoading(true);
    try {
      const result = await changeWritingStyle({ text: state.selectedText, style: data.style });
      handleAIResponse(result.rewrittenText, state.selectedText);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to change style.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onHumanizeSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await humanizeText({ text: state.selectedText });
      handleAIResponse(result.humanizedText, state.selectedText);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to humanize text.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onExpandSubmit = async () => {
    setIsLoading(true);
    try {
      // Use the whole content for expansion context
      const result = await expandTextWithAI({ text: state.editorContent });
      const newContent = state.editorContent + result.expandedText;
      dispatch({ type: 'SET_EDITOR_CONTENT', payload: newContent });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to expand text.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onTranslateSubmit = async (data: z.infer<typeof TranslateSchema>) => {
    setIsLoading(true);
    try {
      const result = await translateToIndianLanguage({ text: state.selectedText, language: data.language });
      handleAIResponse(result.translatedText, state.selectedText);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to translate text.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'rewrite':
        return (
          <Form {...rewriteForm}>
            <form onSubmit={rewriteForm.handleSubmit(onRewriteSubmit)} className="space-y-4">
              <FormField
                control={rewriteForm.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Word Count: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={10}
                        max={1000}
                        step={10}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !state.selectedText}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rewrite
              </Button>
            </form>
          </Form>
        );
      case 'style':
        return (
          <Form {...styleForm}>
            <form onSubmit={styleForm.handleSubmit(onStyleSubmit)} className="space-y-4">
              <FormField
                control={styleForm.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Writing Style</FormLabel>
                    <FormControl>
                       <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="Formal" id="formal" />
                          <FormLabel htmlFor="formal">Formal</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="Casual" id="casual" />
                          <FormLabel htmlFor="casual">Casual</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <RadioGroupItem value="Modern" id="modern" />
                          <FormLabel htmlFor="modern">Modern</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !state.selectedText}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Style
              </Button>
            </form>
          </Form>
        );
      case 'humanize':
        return (
          <div className="flex flex-col items-center gap-4">
            <p>Make the selected text sound more natural and less robotic.</p>
            <Button onClick={onHumanizeSubmit} disabled={isLoading || !state.selectedText}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Humanize
            </Button>
          </div>
        );
        case 'expand':
            return (
              <div className="flex flex-col items-center gap-4">
                <p>Continue writing from the end of your document.</p>
                <Button onClick={onExpandSubmit} disabled={isLoading || !state.hasContent}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Expand Text
                </Button>
              </div>
            );
      case 'translate':
        return (
            <Form {...translateForm}>
                <form onSubmit={translateForm.handleSubmit(onTranslateSubmit)} className="space-y-4">
                    <FormField
                    control={translateForm.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Tamil">Tamil</SelectItem>
                                <SelectItem value="Bengali">Bengali</SelectItem>
                                <SelectItem value="Telugu">Telugu</SelectItem>
                                <SelectItem value="Marathi">Marathi</SelectItem>
                                <SelectItem value="Urdu">Urdu</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading || !state.selectedText}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Translate
                    </Button>
                </form>
            </Form>
        );
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
}
