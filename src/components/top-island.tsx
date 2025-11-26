"use client"

import React from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart, ChevronsLeft, Download, Feather, Languages, Loader2, Target, BookCheck, Type, PencilRuler, History } from 'lucide-react'
import { cn } from '@/lib/utils'

type IndianLanguage = 'Hindi' | 'Tamil' | 'Bengali' | 'Telugu' | 'Marathi' | 'Urdu';

export default function TopIsland({ state, dispatch, actions, activeTab, setActiveTab, isEditorEnlarged, setIsEditorEnlarged }: { state: any, dispatch: any, actions: any, activeTab: string | null, setActiveTab: (tab: string | null) => void, isEditorEnlarged: boolean, setIsEditorEnlarged: (isEnlarged: boolean) => void }) {
  const [language, setLanguage] = React.useState<IndianLanguage>('Hindi');
  const [rewriteLength, setRewriteLength] = React.useState<number>(100);
  
  const handleExportPdf = () => {
    const editorNode = document.getElementById('editor');
    if (editorNode) {
      const contentNode = editorNode.querySelector('#editor-content') as HTMLElement;
      const statsNode = editorNode.querySelector('.absolute.bottom-4.right-4') as HTMLElement;
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

  const TabButton = ({ value, children, disabled, onClick }: { value: string, children: React.ReactNode, disabled?: boolean, onClick?: () => void }) => (
    <button
      onClick={onClick || (() => !disabled && setActiveTab(activeTab === value ? null : value))}
      disabled={disabled}
      className={cn(
        "p-2 rounded-md transition-all duration-200 transform hover:scale-110 text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-transparent tab-glow",
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
        ),
        humanizer: (
            <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4 text-center">Select text in the editor to make it sound more natural.</p>
                <Button onClick={() => { actions.onHumanize(state.selectedText); setActiveTab(null); }} disabled={!state.selectedText || state.aiLoading} className="w-full max-w-sm mx-auto transition-transform transform hover:scale-105">
                {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                Humanize Text
            </Button>
            </div>
        ),
        language: (
             <>
                <p className="text-sm text-muted-foreground mb-4 text-center">Translate selected text to an Indian language.</p>
                <div className="flex gap-4 justify-center">
                <Select value={language} onValueChange={(v: IndianLanguage) => setLanguage(v)}>
                    <SelectTrigger className="bg-secondary w-48">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                        <SelectItem value="Bengali">Bengali</SelectItem>
                        <SelectItem value="Telugu">Telugu</SelectItem>
                        <SelectItem value="Marathi">Marathi</SelectItem>
                        <SelectItem value="Urdu">Urdu</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => { actions.onTranslate(state.selectedText, language); setActiveTab(null); }} disabled={!state.selectedText || state.aiLoading} className="w-48 transition-transform transform hover:scale-105">
                    {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                    Translate Text
                </Button>
            </div>
            </>
        ),
        rewrite: (
            <>
            <p className="text-sm text-muted-foreground mb-4 text-center">Rewrite selected text to a specific word count.</p>
            <div className="flex gap-4 justify-center">
                <Input 
                type="number" 
                value={rewriteLength}
                onChange={(e) => setRewriteLength(Number(e.target.value))}
                className="w-24 bg-secondary"
                />
                <Button onClick={() => { actions.onRewrite(state.selectedText, rewriteLength); setActiveTab(null); }} disabled={!state.selectedText || state.aiLoading} className="w-48 transition-transform transform hover:scale-105">
                    {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                    Rewrite Text
                </Button>
            </div>
            </>
        ),
        references: (
            <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4 text-center">Fetch academic references for the entire document.</p>
                <Button onClick={() => { actions.onFetchReferences(state.editorContent); setActiveTab(null); }} disabled={state.wordCount === 0 || state.aiLoading} className="w-full max-w-sm mx-auto transition-transform transform hover:scale-105">
                {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                Find References
            </Button>
            </div>
        ),
        'view-text': (
            (state.aiResult || state.references.length > 0) ? (
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">AI Result</h4>
                    <ScrollArea className="h-24 w-full rounded-md border p-2 bg-secondary">
                        {state.aiResult && <p className="text-sm">{state.aiResult}</p>}
                        {state.references.length > 0 && (
                            <ul className="space-y-2 text-sm list-disc list-inside">
                                {state.references.map((ref: string, i: number) => <li key={i}>{ref}</li>)}
                            </ul>
                        )}
                    </ScrollArea>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center">No AI generated text or references to show yet. Use one of the AI tools!</p>
            )
        )
    };

    return (
        <div className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            {contentMap[activeTab]}
        </div>
    );
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="bg-card/80 backdrop-blur-lg rounded-xl border border-primary/20 p-1 flex items-center justify-between shadow-2xl shadow-primary/10 transition-all duration-300">
        <div className="flex items-center justify-start flex-1">
          <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2 pl-2 uppercase whitespace-nowrap mr-4">
              <Feather className="w-4 h-4 text-primary" />
              CHRONICLE AI
          </h1>
        </div>
        <div className="flex items-center gap-1">
            <TabButton value="font"><Type/></TabButton>
            <TabButton value="humanizer"><Feather/></TabButton>
            <TabButton value="language"><Languages/></TabButton>
            <TabButton value="rewrite"><PencilRuler/></TabButton>
            <TabButton value="references"><BookCheck/></TabButton>
            <TabButton value="view-text"><History/></TabButton>
            <TabButton value="download" onClick={handleExportPdf}><Download  /></TabButton>
        </div>
      </div>
      <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", activeTab ? 'max-h-96' : 'max-h-0')}>
        {renderTabContent()}
      </div>
    </div>
  )
}
