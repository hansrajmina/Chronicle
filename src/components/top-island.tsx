
'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Feather, Type } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function TopIsland({ state, dispatch, actions }: { state: any, dispatch: any, actions: any }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleExportPdf = () => {
    const editorNode = document.getElementById('editor');
    if (editorNode) {
      const contentNode = editorNode.querySelector('#editor-content') as HTMLElement;
      const statsNode = editorNode.querySelector('.absolute.bottom-4.left-4') as HTMLElement;
      const placeholderNode = editorNode.querySelector('.pointer-events-none') as HTMLElement;

      // Temporarily modify styles for capture
      if (statsNode) statsNode.style.display = 'none';
      if (placeholderNode) placeholderNode.style.display = 'none';
      const originalColor = contentNode.style.color;
      contentNode.style.color = 'black';
      
      html2canvas(contentNode, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      }).then((canvas) => {
        // Restore original styles
        if (statsNode) statsNode.style.display = 'flex';
        if (placeholderNode) placeholderNode.style.display = 'block';
        contentNode.style.color = originalColor;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('chronicle-document.pdf');
      });
    }
  }

  const TabButton = ({ value, children, disabled }: { value: string, children: React.ReactNode, disabled?: boolean }) => (
    <button
      onClick={() => {
        if(value === 'download') {
            handleExportPdf();
            setActiveTab(null);
        } else if (!disabled) {
            setActiveTab(value === activeTab ? null : value);
        }
      }}
      disabled={disabled}
      className={cn(
        "p-2 rounded-md transition-all duration-200 transform hover:scale-110 text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent",
        activeTab === value ? "bg-accent" : ""
      )}
      aria-label={value}
    >
      {children}
    </button>
  )

  const renderTabContent = () => {
    if (!activeTab) return null;

    const contentMap: { [key: string]: React.ReactNode } = {
        font: (
            <div className="flex items-center gap-4 justify-center">
                <Select value={state.font} onValueChange={(font) => { actions.onSetFont(font); setActiveTab(null); }}>
                    <SelectTrigger className="bg-secondary w-48">
                        <SelectValue placeholder="Select Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inter"><span className="font-body font-glow transition-all">Inter</span></SelectItem>
                        <SelectItem value="lora"><span className="font-lora font-glow transition-all">Lora</span></SelectItem>
                        <SelectItem value="mono"><span className="font-mono font-glow transition-all">Monospace</span></SelectItem>
                    </SelectContent>
                </Select>
            </div>
        )
    };

    return (
        <div className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            {contentMap[activeTab]}
        </div>
    );
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-4xl lg:max-w-6xl px-0 sm:px-4">
      <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-primary/20 p-2 flex items-center justify-between shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-start flex-1">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 uppercase whitespace-nowrap mr-2 sm:mr-8">
              <Feather className="w-5 h-5 sm:w-6 md:w-8 md:h-8 text-primary" />
              <span className="hidden sm:inline">CHRONICLE AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2">
            <TabButton value="font"><Type className="w-4 h-4 sm:w-5 md:w-6"/></TabButton>
            <TabButton value="download" disabled={state.wordCount === 0}><Download className="w-4 h-4 sm:w-5 md:w-6"/></TabButton>
        </div>
      </div>
      <div className={cn("transition-all duration-300 ease-in-out", activeTab ? 'max-h-96 overflow-auto' : 'max-h-0 overflow-hidden' )}>
        {renderTabContent()}
      </div>
    </div>
  )
}
