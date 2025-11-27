'use client';

import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import MainEditor from '@/components/main-editor';
import TopIsland from '@/components/top-island';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { humanizeText } from '@/ai/flows/humanize-text';
import { expandTextWithAI } from '@/ai/flows/expand-text-with-ai';
import { translateToIndianLanguage } from '@/ai/flows/translate-to-indian-language';
import { rewriteTextToLength } from '@/ai/flows/rewrite-text-to-length';
import { changeWritingStyle, type WritingStyle } from '@/ai/flows/change-writing-style';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        AOS: any;
    }
}

type IndianLanguage = 'Hindi' | 'Tamil' | 'Bengali' | 'Telugu' | 'Marathi' | 'Urdu';

type AppState = {
  editorContent: string;
  wordCount: number;
  readingTime: number;
  selectedText: string;
  wordGoal: number;
  aiLoading: boolean;
  aiResult: string;
  font: 'inter' | 'lora' | 'mono';
  isTextExpanded: boolean;
  hasContent: boolean;
};

type AppAction =
  | { type: 'SET_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_REPHRASED_CONTENT'; payload: string }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_WORD_GOAL'; payload: number }
  | { type: 'SET_AI_LOADING'; payload: boolean }
  | { type: 'SET_AI_RESULT'; payload: string }
  | { type: 'APPEND_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_FONT'; payload: 'inter' | 'lora' | 'mono' }
  | { type: 'SET_IS_TEXT_EXPANDED'; payload: boolean };

const initialState: AppState = {
  editorContent: '',
  wordCount: 0,
  readingTime: 0,
  selectedText: '',
  wordGoal: 500,
  aiLoading: false,
  aiResult: '',
  font: 'inter',
  isTextExpanded: false,
  hasContent: false,
};

const checkIsEmpty = (htmlContent: string) => {
    if (!htmlContent) return true;
    const strippedContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (strippedContent.length > 0) return false;
    
    // Check for common empty states from contentEditable
    return htmlContent === '<p><br></p>' || htmlContent === '<p></p>' || htmlContent === '<div><br></div>' || htmlContent === '<div></div>' || htmlContent === '<br>';
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_EDITOR_CONTENT': {
      const content = action.payload;
      const isEmpty = checkIsEmpty(content);
      const newWordCount = isEmpty ? 0 : content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.ceil(newWordCount / 200);
      return { ...state, editorContent: content, wordCount: newWordCount, readingTime, hasContent: !isEmpty, isTextExpanded: false };
    }
    case 'APPEND_EDITOR_CONTENT': {
        const lastChar = state.editorContent.replace(/<[^>]*>/g, '').slice(-1);
        const separator = (lastChar === '' || lastChar === ' ' || lastChar === '.' || lastChar === ',') ? '' : ' ';
        const animatedText = action.payload.split(' ').map((word, index) => `<span class="ai-text-fade-in" style="animation-delay: ${index * 50}ms;">${word}</span>`).join(' ');
        const appendedContent = state.editorContent + separator + animatedText;
        const appendedWordCount = appendedContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        const appendedReadingTime = Math.ceil(appendedWordCount / 200);
        return { ...state, editorContent: appendedContent, wordCount: appendedWordCount, readingTime: appendedReadingTime, isTextExpanded: true, hasContent: true };
    }
    case 'SET_REPHRASED_CONTENT': {
        const content = action.payload;
        const newWordCount = checkIsEmpty(content) ? 0 : content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        const newReadingTime = Math.ceil(newWordCount / 200);
        return { ...state, editorContent: content, wordCount: newWordCount, readingTime: newReadingTime, hasContent: !checkIsEmpty(content) };
    }
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.payload };
    case 'SET_WORD_GOAL':
      return { ...state, wordGoal: action.payload };
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.payload };
    case 'SET_AI_RESULT':
        return { ...state, aiResult: action.payload };
    case 'SET_FONT':
      return { ...state, font: action.payload };
    case 'SET_IS_TEXT_EXPANDED':
      return { ...state, isTextExpanded: action.payload };
    default:
      return state;
  }
};


export default function ChronicleLayout() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    window.AOS && window.AOS.init({ once: true });
  }, []);

  const handleContentChange = useCallback((content: string) => {
    dispatch({ type: 'SET_EDITOR_CONTENT', payload: content });
  }, []);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: selection.toString() });
    } else {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: '' });
    }
  }, []);

  const handleHumanizeText = async (text: string) => {
    if (!text) {
        toast({ title: "No text selected", description: "Please select text to humanize." });
        return;
    }
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
        const result = await humanizeText({ text });
        dispatch({ type: 'SET_AI_RESULT', payload: result.humanizedText });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
        dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  };

  const handleExpandText = async () => {
    const text = state.editorContent;
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
      const result = await expandTextWithAI({ text: text.replace(/<[^>]*>/g, ' ') });
      dispatch({ type: 'APPEND_EDITOR_CONTENT', payload: result.expandedText });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  };

  const handleTranslate = async (text: string, language: IndianLanguage) => {
    if (!text) {
        toast({ title: "No text selected", description: "Please select text to translate." });
        return;
    }
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
        const result = await translateToIndianLanguage({ text, language });
        dispatch({ type: 'SET_AI_RESULT', payload: result.translatedText });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
        dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  }

  const handleRewrite = async (text: string, length: number) => {
    if (!text) {
        toast({ title: "No text selected", description: "Please select text to rewrite." });
        return;
    }
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
        const result = await rewriteTextToLength({ text, length });
        dispatch({ type: 'SET_AI_RESULT', payload: result.rewrittenText });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
        dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  }

  const handleChangeStyle = async (text: string, style: WritingStyle) => {
    if (!text) {
        toast({ title: "No text selected", description: "Please select text to change its style." });
        return;
    }
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
        const result = await changeWritingStyle({ text, style });
        dispatch({ type: 'SET_AI_RESULT', payload: result.rewrittenText });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
        dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  };

  const handleRephraseWithResult = () => {
    const rephrasedText = state.aiResult;
    const currentContent = state.editorContent;
    const newContent = currentContent.replace(state.selectedText, rephrasedText);
    dispatch({ type: 'SET_REPHRASED_CONTENT', payload: newContent });
    dispatch({ type: 'SET_AI_RESULT', payload: ''});
    dispatch({ type: 'SET_SELECTED_TEXT', payload: '' });
    setActiveTab(null);
  }

  const actions = {
    onSetFont: (font: 'inter' | 'lora' | 'mono') => dispatch({ type: 'SET_FONT', payload: font }),
    onHumanize: handleHumanizeText,
    onExpand: handleExpandText,
    onTranslate: handleTranslate,
    onRewrite: handleRewrite,
    onChangeStyle: handleChangeStyle,
  };

  const hasAIResultForSelection = state.aiResult && state.selectedText && state.aiResult.length > 0;
  
  const layoutClasses = state.isTextExpanded ? 
    "w-full max-w-4xl mx-auto transition-all duration-500" :
    "w-full max-w-6xl mx-auto transition-all duration-500 grid grid-cols-1 md:grid-cols-5 gap-8 items-center";

  return (
    <div className="min-h-screen bg-background text-foreground font-body feather-cursor p-4 sm:p-6 md:p-8 flex flex-col">
      <TopIsland state={state} dispatch={dispatch} actions={actions} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow flex flex-col justify-center items-center pt-24 md:pt-32 lg:pt-40">
        <div className={layoutClasses} data-aos="fade-up">
            {!state.isTextExpanded && (
                <div className="md:col-span-2 text-center md:text-left flex flex-col items-center md:items-start" data-aos="fade-right" data-aos-delay="200">
                    <h1 className="font-bold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/50 drop-shadow-sm text-4xl md:text-5xl lg:text-6xl">
                    THE FUTURE OF WRITING IS HERE
                    </h1>
                    <p className="mt-2 md:mt-4 text-muted-foreground max-w-md mx-auto md:mx-0">
                    Chronicle AI helps you write faster, smarter, and better.
                    </p>
                </div>
            )}
            <div className={cn("relative", state.isTextExpanded ? "w-full" : "md:col-span-3")}>
              <MainEditor
                ref={editorRef}
                content={state.editorContent}
                onContentChange={handleContentChange}
                onSelectionChange={handleSelectionChange}
                font={state.font}
              />
              <div className="absolute bottom-[-1rem] right-4 transform translate-y-full md:translate-y-0 md:bottom-4 md:right-4 z-10 flex gap-2">
                {hasAIResultForSelection ? (
                    <Button onClick={handleRephraseWithResult} disabled={state.aiLoading} className="transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
                        {state.aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Rephrase
                    </Button>
                ) : (
                  state.hasContent && (
                        <Button onClick={handleExpandText} disabled={state.aiLoading} className="transition-all transform hover:scale-105 shadow-lg shadow-primary/30">
                            {state.aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                            Continue Writing
                        </Button>
                    )
                )}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
