"use client"

import React, { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock, FileBadge } from 'lucide-react';

interface MainEditorProps {
  content: string;
  font: 'inter' | 'lora' | 'mono';
  onContentChange: (content: string) => void;
  onSelectionChange: () => void;
}

const fontClasses = {
    inter: 'font-body',
    lora: 'font-lora',
    mono: 'font-mono'
}

const MainEditor = forwardRef<HTMLDivElement, MainEditorProps>(
  ({ content, onContentChange, onSelectionChange, font }, ref) => {
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
  
  const isEmpty = !content || content === '<p><br></p>';

  return (
    <div className='relative'>
        <div
            id="editor"
            ref={internalRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={onSelectionChange}
            onKeyUp={onSelectionChange}
            className={cn(
                'w-full h-full p-8 md:p-12 lg:p-16 focus:outline-none overflow-y-auto prose dark:prose-invert lg:prose-xl',
                fontClasses[font],
                'relative'
            )}
            style={{ minHeight: 'calc(100vh - 20rem)' }}
            />
        {isEmpty && (
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-center"
            >
                Start writing your masterpiece...
            </div>
        )}
        <div className="absolute bottom-4 right-4 flex items-center gap-4 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border">
            <div className="flex items-center gap-2">
                <FileBadge className="w-4 h-4" />
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
