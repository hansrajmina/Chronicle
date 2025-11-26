"use client"

import React, { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock, FileText } from 'lucide-react';

interface MainEditorProps {
  content: string;
  font: 'inter' | 'lora' | 'mono';
  onContentChange: (content: string) => void;
  onSelectionChange: () => void;
  onFocus: () => void;
}

const fontClasses = {
    inter: 'font-body',
    lora: 'font-lora',
    mono: 'font-mono'
}

const MainEditor = forwardRef<HTMLDivElement, MainEditorProps>(
  ({ content, onContentChange, onSelectionChange, font, onFocus }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const internalRef = (ref || localRef) as React.RefObject<HTMLDivElement>;

  const wordCount = content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    if (internalRef.current && internalRef.current.innerHTML !== content) {
      internalRef.current.innerHTML = content;
    }
  }, [content, internalRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
  };
  
  const isEmpty = !content || content === '<p><br></p>' || content === '';

  return (
    <div className='relative'>
        <div
            id="editor"
            ref={internalRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={onSelectionChange}
            onKeyUp={onSelectionChange}
            onFocus={onFocus}
            className={cn(
                'w-full h-full p-8 focus:outline-none overflow-y-auto prose prose-invert lg:prose-xl',
                fontClasses[font],
                'relative'
            )}
            style={{ minHeight: '300px' }}
            />
        {isEmpty && (
            <div 
                className="absolute top-8 left-8 text-muted-foreground pointer-events-none"
            >
                Start writing your masterpiece...
            </div>
        )}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
            </div>
        </div>
    </div>
  );
});

MainEditor.displayName = "MainEditor";

export default MainEditor;
