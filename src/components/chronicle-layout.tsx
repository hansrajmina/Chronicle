'use client';

import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import MainEditor from '@/components/main-editor';
import TopIsland from '@/components/top-island';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { humanizeText } from '@/ai/flows/humanize-text';
import { expandTextWithAI } from '@/ai/flows/expand-text-with-ai';
import { translateToIndianLanguage } from '@/ai/flows/translate-to-indian-language';
import { rewriteTextToLength } from '@/ai/flows/rewrite-text-to-length';
import { changeWritingStyle, type WritingStyle } from '@/ai/flows/change-writing-style';
import { cn } from '@/lib/utils';
import { fetchAcademicReferences } from '@/ai/flows/fetch-academic-references';

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
  references: string[];
  font: 'inter' | 'lora' | 'mono';
  isTextExpanded: boolean;
};

type AppAction =
  | { type: 'SET_EDITOR_CONTENT'; payload: string }
  | { type: 'SET_REPHRASED_CONTENT'; payload: string }
  | { type: 'SET_SELECTED_TEXT'; payload: string }
  | { type: 'SET_WORD_GOAL'; payload: number }
  | { type: 'SET_AI_LOADING'; payload: boolean }
  | { type: 'SET_AI_RESULT'; payload: string }
  | { type: 'SET_REFERENCES'; payload: string[] }
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
  references: [],
  font: 'inter',
  isTextExpanded: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_EDITOR_CONTENT':
      const content = action.payload;
      const newWordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
      const readingTime = Math.ceil(newWordCount / 200);
      return { ...state, editorContent: content, wordCount: newWordCount, readingTime, isTextExpanded: false };
    case 'APPEND_EDITOR_CONTENT':
        const lastChar = state.editorContent.replace(/<[^>]*>/g, '').slice(-1);
        const separator = (lastChar === '' || lastChar === ' ' || lastChar === '.' || lastChar === ',') ? '' : ' ';
        const animatedText = action.payload.split(' ').map((word, index) => `<span class="ai-text-fade-in" style="animation-delay: ${index * 50}ms;">${word}</span>`).join(' ');
        const appendedContent = state.editorContent + separator + animatedText;
        const appendedWordCount = appendedContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        const appendedReadingTime = Math.ceil(appendedWordCount / 200);
        return { ...state, editorContent: appendedContent, wordCount: appendedWordCount, readingTime: appendedReadingTime, isTextExpanded: true };
    case 'SET_REPHRASED_CONTENT':
        const rephrasedContent = action.payload;
        const rephrasedWordCount = rephrasedContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
        const rephrasedReadingTime = Math.ceil(rephrasedWordCount / 200);
        return { ...state, editorContent: rephrasedContent, wordCount: rephrasedWordCount, readingTime: rephrasedReadingTime, isTextExpanded: false };
    case 'SET_SELECTED_TEXT':
      return { ...state, selectedText: action.payload };
    case 'SET_WORD_GOAL':
      return { ...state, wordGoal: action.payload };
    case 'SET_AI_LOADING':
      return { ...state, aiLoading: action.payload };
    case 'SET_AI_RESULT':
      setActiveTab('view-text');
      return { ...state, aiResult: action.payload, references: [] };
    case 'SET_REFERENCES':
      setActiveTab('view-text');
      return { ...state, references: action.payload, aiResult: '' };
    case 'SET_FONT':
      return { ...state, font: action.payload };
    case 'SET_IS_TEXT_EXPANDED':
      return { ...state, isTextExpanded: action.payload };
    default:
      return state;
  }
};

let setActiveTab: (tab: string | null) => void;

export default function ChronicleLayout() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [activeTabState, setActiveTabState] = useState<string | null>(null);
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  
  const hasContent = state.wordCount > 0;

  setActiveTab = (tab) => {
    if (activeTabState === tab) {
      setActiveTabState(null);
    } else {
      setActiveTabState(tab);
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.init({
        once: true,
        disable: 'phone',
        duration: 500,
        easing: 'ease-out-cubic',
      });
    }
  }, []);

  const onContinueWriting = useCallback(() => {
    handleApiCall(expandTextWithAI, { text: state.editorContent.replace(/<[^>]*>/g, ' ').trim() }, 'Text expanded successfully.');
  }, [state.editorContent]);
  
  const onRephrase = useCallback(() => {
    handleApiCall(changeWritingStyle, { text: state.editorContent, style: 'Casual' }, 'Text rephrased successfully.', true);
  }, [state.editorContent]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        if (state.aiLoading || state.wordCount === 0) return;
        
        if (state.isTextExpanded) {
          onRephrase();
        } else {
          onContinueWriting();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.aiLoading, state.wordCount, state.isTextExpanded, onContinueWriting, onRephrase]);
  
  const handleContentChange = useCallback((content: string) => {
    dispatch({ type: 'SET_EDITOR_CONTENT', payload: content });
  }, []);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      dispatch({ type: 'SET_SELECTED_TEXT', payload: selection?.toString() || '' });
    }
  }, []);

  const handleApiCall = async (apiFn: Function, payload: any, successMsg: string, isRephrase = false) => {
    dispatch({ type: 'SET_AI_LOADING', payload: true });
    try {
      const result = await apiFn(payload);
      
      if (isRephrase) {
        dispatch({ type: 'SET_REPHRASED_CONTENT', payload: result.rewrittenText });
        toast({ title: "Success", description: successMsg });
      } else {
        if (result.humanizedText) dispatch({ type: 'SET_AI_RESULT', payload: result.humanizedText });
        if (result.expandedText) {
            dispatch({ type: 'APPEND_EDITOR_CONTENT', payload: result.expandedText });
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
        if (result.rewrittenText) {
          dispatch({ type: 'SET_REPHRASED_CONTENT', payload: result.rewrittenText });
        }
        if (result.references) dispatch({ type: 'SET_REFERENCES', payload: result.references });

        if (!result.expandedText) {
            setActiveTabState('view-text');
        } else {
          toast({ title: "Success", description: successMsg });
        }
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not process request." });
      dispatch({ type: 'SET_AI_RESULT', payload: '' });
      dispatch({ type: 'SET_REFERENCES', payload: [] });
    } finally {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }
  };

  const onHumanize = (text: string) => handleApiCall(humanizeText, { text }, 'Text humanized.');
  const onTranslate = (text: string, language: IndianLanguage) => handleApiCall(translateToIndianLanguage, { text, language }, 'Text translated.');
  const onRewrite = (text: string, length: number) => handleApiCall(rewriteTextToLength, { text, length }, 'Text rewritten.');
  const onGetReferences = (text: string) => handleApiCall(fetchAcademicReferences, { text }, 'References fetched.');
  const onChangeStyle = (text: string, style: WritingStyle) => handleApiCall(changeWritingStyle, { text, style }, 'Style changed.');
  const onSetFont = (font: 'inter' | 'lora' | 'mono') => dispatch({ type: 'SET_FONT', payload: font });

  const handleEditorClick = () => {
    if (activeTabState !== null) {
      setActiveTabState(null);
    }
  };

  const actions = { onContinueWriting, onHumanize, onTranslate, onRewrite, onSetFont, onChangeStyle, onGetReferences };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground feather-cursor">
      <TopIsland
        state={state}
        dispatch={dispatch}
        actions={actions}
        activeTab={activeTabState}
        setActiveTab={setActiveTab}
      />
      
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 mt-24 sm:mt-28 md:mt-32">
        <div className="w-full flex items-center justify-center gap-8 md:flex-row flex-col">
            <section 
                className={cn(
                  "text-center md:text-left transition-all duration-500 aos-init",
                  hasContent ? "md:w-1/5" : "md:w-2/5"
                )}
                data-aos="fade-right"
            >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/50 drop-shadow-sm">THE FUTURE OF WRITING IS HERE</h1>
                <p className="mt-4 text-xs text-muted-foreground">Chronicle AI helps you write faster, smarter, and better.</p>
                <Button 
                    onClick={state.isTextExpanded ? onRephrase : onContinueWriting} 
                    disabled={state.aiLoading || state.wordCount === 0} 
                    size="lg"
                    className="mt-6 px-12 py-6 text-lg transition-transform transform hover:scale-105 shadow-[0_0_20px_4px] shadow-primary/30 hover:shadow-primary/50"
                >
                    {state.aiLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    {state.isTextExpanded ? 'Rephrase' : 'Continue Writing'}
                </Button>
            </section>

            <section 
                className={cn(
                  "w-full transition-all duration-500 aos-init",
                  hasContent ? "md:w-4/5" : "md:w-3/5"
                )}
                data-aos="fade-left" 
                data-aos-delay="200"
                onClick={handleEditorClick}
            >
                <div className={cn(
                  "w-full bg-card/50 backdrop-blur-sm border-8 rounded-lg shadow-2xl transition-all duration-300",
                  'shadow-primary/40'
                )}>
                  <div className="p-0">
                    <MainEditor
                      ref={editorRef}
                      font={state.font}
                      content={state.editorContent}
                      onContentChange={handleContentChange}
                      onSelectionChange={handleSelectionChange}
                    />
                  </div>
                </div>
                
            </section>
        </div>
      </main>
    </div>
  );
}
