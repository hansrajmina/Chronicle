"use client";

import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import MainEditor from '@/components/main-editor';
import TopIsland from '@/components/top-island';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { humanizeText } from '@/ai/flows/humanize-text';
import { expandTextWithAI } from '@/ai/flows/expand-text-with-ai';
import { translateToIndianLanguage } from '@/ai/flows/translate-to-indian-language';
import { fetchAcademicReferences } from '@/ai/flows/fetch-academic-references';
import { rewriteTextToLength } from '@/ai/flows/rewrite-text-to-length';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        AOS: any;
    }
}

type IndianLanguage = 'Hindi' | 'Tamil' | 'Bengali' | 'Telugu' | 'Marathi' | 'Urdu';

type GamificationState = {
  xp: number;
  streak: number;
  lastWriteDate: string | null;
};

type AppState = {
  editorContent: string;
  wordCount: number;
  readingTime: number;
  selectedText: string;
  gamification: GamificationState;
  wordGoal: number;
  aiLoading: boolean;
  aiResult: string;
  references: string[];
  font: 'inter' | 'lora' | 'mono';
};

type AppAction =
  | { type: 'SET_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_WORD_GOAL'; payload: number }
  | { type: 'UPDATE_GAMIFICATION'; payload: { xp: number; streak: number } }
  | { type: 'SET_AI_LOADING'; payload: boolean }
  | { type: 'SET_AI_RESULT'; payload: string }
  | { type: 'SET_REFERENCES'; payload: string[] }
  | { type: 'APPEND_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_FONT'; payload: 'inter' | 'lora' | 'mono' };

const initialState: AppState = {
  editorContent: '',
  wordCount: 0,
  readingTime: 0,
  selectedText: '',
  gamification: { xp: 0, streak: 0, lastWriteDate: null },
  wordGoal: 500,
  aiLoading: false,
  aiResult: '',
  references: [],
  font: 'inter',
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_EDITOR_CONTENT':
      const content = action.payload;
      const newWordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.ceil(newWordCount / 200);
      return { ...state, editorContent: content, wordCount: newWordCount, readingTime };
    case 'APPEND_EDITOR_CONTENT':
      const appendedContent = state.editorContent + action.payload;
      const appendedWordCount = appendedContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
      const appendedReadingTime = Math.ceil(appendedWordCount / 200);
      return { ...state, editorContent: appendedContent, wordCount: appendedWordCount, readingTime: appendedReadingTime };
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.payload };
    case 'SET_WORD_GOAL':
      return { ...state, wordGoal: action.payload };
    case 'UPDATE_GAMIFICATION':
      const today = new Date().toISOString().split('T')[0];
      return { ...state, gamification: { ...action.payload, lastWriteDate: today } };
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.payload };
    case 'SET_AI_RESULT':
      return { ...state, aiResult: action.payload, references: [] };
    case 'SET_REFERENCES':
      return { ...state, references: action.payload, aiResult: '' };
    case 'SET_FONT':
      return { ...state, font: action.payload };
    default:
      return state;
  }
};

export default function ChronicleLayout() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isEditorEnlarged, setIsEditorEnlarged] = useState(false);
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.init({
        once: true,
        disable: 'phone',
        duration: 500,
        easing: 'ease-out-cubic',
      });
    }
  }, [])

  useEffect(() => {
    const savedXP = parseInt(localStorage.getItem('chronicle_xp') || '0', 10);
    const savedStreak = parseInt(localStorage.getItem('chronicle_streak') || '0', 10);
    const lastWriteDate = localStorage.getItem('chronicle_lastWriteDate');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentStreak = savedStreak;
    if (lastWriteDate && lastWriteDate < yesterday) {
      currentStreak = 0; // Reset streak if user missed a day
    }
    
    dispatch({ type: 'UPDATE_GAMIFICATION', payload: { xp: savedXP, streak: currentStreak } });
  }, []);
  
  const handleContentChange = useCallback((content: string) => {
    const oldWordCount = state.wordCount;
    dispatch({ type: 'SET_EDITOR_CONTENT', payload: content });
    const newWordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    const wordDiff = newWordCount - oldWordCount;

    // Gamification Logic
    if (wordDiff > 5) {
        const newXp = state.gamification.xp + Math.floor(wordDiff / 5);
        const today = new Date().toISOString().split('T')[0];
        const lastWrite = state.gamification.lastWriteDate;
        let newStreak = state.gamification.streak;

        if (lastWrite !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            newStreak = (lastWrite === yesterday) ? newStreak + 1 : 1;
        }

        dispatch({ type: 'UPDATE_GAMIFICATION', payload: { xp: newXp, streak: newStreak } });
        localStorage.setItem('chronicle_xp', newXp.toString());
        localStorage.setItem('chronicle_streak', newStreak.toString());
        localStorage.setItem('chronicle_lastWriteDate', today);
    }
  }, [state.wordCount, state.gamification]);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: selection?.toString() || '' });
    }
  }, []);

  const handleApiCall = async (apiFn: Function, payload: any, successMsg: string) => {
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
      const result = await apiFn(payload);
      if (result.humanizedText) dispatch({ type: 'SET_AI_RESULT', payload: result.humanizedText });
      if (result.expandedText) {
          dispatch({ type: 'APPEND_EDITOR_CONTENT', payload: ` ${result.expandedText}` });
          if (editorRef.current) {
            editorRef.current.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
      }
      if (result.translatedText) dispatch({ type: 'SET_AI_RESULT', payload: result.translatedText });
      if (result.rewrittenText) dispatch({ type: 'SET_AI_RESULT', payload: result.rewrittenText });
      if (result.references) dispatch({ type: 'SET_REFERENCES', payload: result.references });
      if (!result.expandedText) toast({ title: "Success", description: successMsg });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not process request." });
      dispatch({ type: 'SET_AI_RESULT', payload: '' });
      dispatch({ type: 'SET_REFERENCES', payload: [] });
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  };

  const onContinueWriting = () => {
    setIsEditorEnlarged(true);
    handleApiCall(expandTextWithAI, { text: state.editorContent }, 'Text expanded successfully.');
  };
  const onHumanize = (text: string) => handleApiCall(humanizeText, { text }, 'Text humanized.');
  const onTranslate = (text: string, language: IndianLanguage) => handleApiCall(translateToIndianLanguage, { text, language }, 'Text translated.');
  const onFetchReferences = (text: string) => handleApiCall(fetchAcademicReferences, { text }, 'References fetched.');
  const onRewrite = (text: string, length: number) => handleApiCall(rewriteTextToLength, { text, length }, 'Text rewritten.');
  const onSetFont = (font: 'inter' | 'lora' | 'mono') => dispatch({ type: 'SET_FONT', payload: font });

  const actions = { onContinueWriting, onHumanize, onTranslate, onFetchReferences, onRewrite, onSetFont };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground feather-cursor">
      <TopIsland
        state={state}
        dispatch={dispatch}
        actions={actions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isEditorEnlarged={isEditorEnlarged}
        setIsEditorEnlarged={setIsEditorEnlarged}
      />
      
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-24">
        <div className={cn("w-full flex flex-col md:flex-row items-center justify-center gap-8 transition-all duration-500", isEditorEnlarged ? 'md:items-start' : 'md:items-center')}>
            <section 
                className={cn("text-center md:text-left transition-opacity duration-500", isEditorEnlarged ? 'md:w-0 opacity-0' : 'md:w-1/3 opacity-100')}
                data-aos="fade-right"
            >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase font-hollow">THE FUTURE OF WRITING IS HERE</h1>
                <p className="mt-4 text-xs text-muted-foreground">Chronicle AI helps you write faster, smarter, and better.</p>
                <div className="mt-8">
                  <Button 
                    onClick={onContinueWriting} 
                    disabled={isEditorEnlarged || state.wordCount === 0}
                    className="w-full max-w-xs transition-transform transform hover:scale-105"
                  >
                      <Sparkles className="mr-2" />
                      Continue Writing
                  </Button>
                </div>
            </section>

            <section 
                className={cn("w-full transition-all duration-500", isEditorEnlarged ? 'md:w-3/4' : 'md:w-1/2')}
                data-aos="fade-left" 
                data-aos-delay="200"
            >
                <div className="w-full bg-card/50 backdrop-blur-sm border rounded-lg shadow-2xl transition-all duration-300 hover:shadow-primary/20">
                  <div className="p-0">
                    <MainEditor
                      ref={editorRef}
                      font={state.font}
                      content={state.editorContent}
                      onContentChange={handleContentChange}
                      onSelectionChange={handleSelectionChange}
                      onFocus={() => {
                        setActiveTab(null);
                      }}
                    />
                  </div>
                </div>
                
            </section>
        </div>
      </main>
    </div>
  );
}
