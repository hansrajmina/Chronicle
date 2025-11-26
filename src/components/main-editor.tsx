"use client"

import React, { useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface MainEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSelectionChange: () => void;
}

const MainEditor = forwardRef<HTMLDivElement, MainEditorProps>(
  ({ content, onContentChange, onSelectionChange }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const internalRef = (ref || localRef) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    if (internalRef.current && internalRef.current.innerHTML !== content) {
      internalRef.current.innerHTML = content;
    }
  }, [content, internalRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
  };

  return (
    <div
      id="editor"
      ref={internalRef}
      contentEditable
      onInput={handleInput}
      onMouseUp={onSelectionChange}
      onKeyUp={onSelectionChange}
      className={cn(
        'w-full h-full max-w-4xl mx-auto p-8 bg-card rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto prose dark:prose-invert lg:prose-xl',
        'neobrutalist-editor'
      )}
      style={{ minHeight: 'calc(100vh - 15rem)', paddingBottom: '2rem' }}
    >
    </div>
  );
});

MainEditor.displayName = "MainEditor";

export default MainEditor;
