"use client"

import React, { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock, FileText, Wand2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainEditorProps {
  content: string;
  font: 'inter' | 'lora' | 'mono';
  onContentChange: (content: string) => void;
  onSelectionChange: () => void;
  actions: {
    onExpandText: () => void;
  },
  state: {
    isAiLoading: boolean;
  }
}

const fontClasses = {
    inter: 'font-body',
    lora: 'font-lora',
    mono: 'font-mono'
}

const MainEditor = forwardRef<HTMLDivElement, MainEditorProps>(
  ({ content, onContentChange, onSelectionChange, font, actions, state }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const internalRef = (ref || localRef) as React.RefObject<HTMLDivElement>;

  const checkIsEmpty = (htmlContent: string) => {
    if (!htmlContent) return true;
    const strippedContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (strippedContent.length > 0) return false;
    
    // Check for common empty states from contentEditable
    return htmlContent === '<p><br></p>' || htmlContent === '<p></p>' || htmlContent === '<div><br></div>' || htmlContent === '<div></div>' || htmlContent === '<br>';
  };
  
  const isEmpty = checkIsEmpty(content);
  const wordCount = isEmpty ? 0 : content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);


  useEffect(() => {
    const editorNode = internalRef.current?.querySelector('#editor-content');
    if (editorNode && editorNode.innerHTML !== content) {
        editorNode.innerHTML = content;
    }
  }, [content, internalRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const currentContent = e.currentTarget.innerHTML;
    onContentChange(currentContent);
  };
  

  return (
    <div className='relative border-2 rounded-lg border-primary/20' id="editor" ref={internalRef}>
        <div
            id="editor-content"
            contentEditable
            onInput={handleInput}
            onMouseUp={onSelectionChange}
            onKeyUp={onSelectionChange}
            className={cn(
                'w-full h-full p-8 focus:outline-none overflow-y-auto prose prose-invert lg:prose-xl',
                fontClasses[font],
                'relative'
            )}
            style={{ minHeight: '400px' }}
            />
        {isEmpty && (
            <div 
                className="absolute top-8 left-8 text-muted-foreground pointer-events-none"
            >
                Start writing your masterpiece...
            </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{wordCount} words</span>
                </div>
                {readingTime > 0 && (
                  <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{readingTime} min read</span>
                  </div>
                )}
            </div>

            {!isEmpty && (
                <Button 
                    onClick={actions.onExpandText} 
                    disabled={state.isAiLoading}
                    size="sm"
                    className="rounded-full shadow-lg shadow-primary/20 tab-glow"
                >
                    {state.isAiLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Wand2 className="w-4 h-4" />
                    )}
                    <span>Continue Writing</span>
                </Button>
            )}
        </div>
    </div>
  );
});

MainEditor.displayName = "MainEditor";

export default MainEditor;
    