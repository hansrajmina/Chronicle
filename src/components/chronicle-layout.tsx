'use client';

import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import MainEditor from '@/components/main-editor';
import TopIsland from '@/components/top-island';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { expandTextWithAI } from '@/ai/flows/expand-text-with-ai';

declare global {
    interface Window {
        AOS: any;
    }
}

type AppState = {
  editorContent: string;
  wordCount: number;
  readingTime: number;
  selectedText: string;
  wordGoal: number;
  font: 'inter' | 'lora' | 'mono';
  hasContent: boolean;
  isAiLoading: boolean;
};

type AppAction =
  | { type: 'SET_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_WORD_GOAL'; payload: number }
  | { type: 'SET_FONT'; payload: 'inter' | 'lora' | 'mono' }
  | { type: 'SET_AI_LOADING'; payload: boolean };

const initialState: AppState = {
  editorContent: '',
  wordCount: 0,
  readingTime: 0,
  selectedText: '',
  wordGoal: 500,
  font: 'inter',
  hasContent: false,
  isAiLoading: false,
};

const checkIsEmpty = (htmlContent: string) => {
    if (!htmlContent) return true;
    const strippedContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (strippedContent.length > 0) return false;
    
    return htmlContent === '<p><br></p>' || htmlContent === '<p></p>' || htmlContent === '<div><br></div>' || htmlContent === '<div></div>' || htmlContent === '<br>';
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_EDITOR_CONTENT': {
      const content = action.payload;
      const isEmpty = checkIsEmpty(content);
      const newWordCount = isEmpty ? 0 : content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.ceil(newWordCount / 200);
      return { ...state, editorContent: content, wordCount: newWordCount, readingTime, hasContent: !isEmpty };
    }
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.payload };
    case 'SET_WORD_GOAL':
      return { ...state, wordGoal: action.payload };
    case 'SET_FONT':
      return { ...state, font: action.payload };
    case 'SET_AI_LOADING':
      return { ...state, isAiLoading: action.payload };
    default:
      return state;
  }
};


export default function ChronicleLayout() {
  const [state, dispatch] = useReducer(appReducer, initialState);
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

  const handleExpandText = async () => {
    if (state.isAiLoading) return;
    dispatch({ type: 'SET_AI_LOADING', payload: true });

    try {
        const textToExpand = state.editorContent.replace(/<[^>]*>/g, ' ').trim();
        const result = await expandTextWithAI({ text: textToExpand });
        
        const newContent = `${state.editorContent} ${result.expandedText}`;
        dispatch({ type: 'SET_EDITOR_CONTENT', payload: newContent });

        // Move cursor to the end
        setTimeout(() => {
            const editorNode = editorRef.current?.querySelector('#editor-content');
            if(editorNode) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(editorNode);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }, 0)


    } catch (error) {
        console.error('Error expanding text:', error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not expand the text. Please try again.",
        });
    } finally {
        dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  };

  const actions = {
    onSetFont: (font: 'inter' | 'lora' | 'mono') => dispatch({ type: 'SET_FONT', payload: font }),
    onExpandText: handleExpandText,
  };
  
  const layoutClasses = state.hasContent ? 
    "w-full max-w-4xl mx-auto transition-all duration-500" :
    "w-full max-w-6xl mx-auto transition-all duration-500 grid grid-cols-1 md:grid-cols-5 gap-8 items-center";

  return (
    <div className="min-h-screen bg-background text-foreground font-body feather-cursor p-4 sm:p-6 md:p-8 flex flex-col">
      <TopIsland state={state} dispatch={dispatch} actions={actions} />
      
      <main className="flex-grow flex flex-col justify-center items-center pt-24 md:pt-32 lg:pt-40">
        <div className={layoutClasses} data-aos="fade-up">
            {!state.hasContent && (
                <div className="md:col-span-2 text-center md:text-left flex flex-col items-center md:items-start" data-aos="fade-right" data-aos-delay="200">
                    <h1 className="font-bold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/50 drop-shadow-sm text-4xl md:text-5xl lg:text-6xl">
                    THE FUTURE OF WRITING IS HERE
                    </h1>
                    <p className="mt-2 md:mt-4 text-muted-foreground max-w-md mx-auto md:mx-0">
                    Chronicle AI helps you write faster, smarter, and better.
                    </p>
                </div>
            )}
            <div className={cn("relative", state.hasContent ? "w-full" : "md:col-span-3")}>
              <MainEditor
                ref={editorRef}
                content={state.editorContent}
                onContentChange={handleContentChange}
                onSelectionChange={handleSelectionChange}
                font={state.font}
                actions={actions}
                state={state}
              />
            </div>
        </div>
      </main>
    </div>
  );
}
