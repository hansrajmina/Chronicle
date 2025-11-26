"use client"

import React from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart, Download, Feather, Languages, Loader2, Target, BookCheck, FileText, Type, Clock } from 'lucide-react'

type IndianLanguage = 'Hindi' | 'Tamil' | 'Bengali' | 'Telugu' | 'Marathi' | 'Urdu';

export default function TopIsland({ state, dispatch, actions }: { state: any, dispatch: any, actions: any }) {
  const [language, setLanguage] = React.useState<IndianLanguage>('Hindi');
  
  const handleExportPdf = () => {
    const editor = document.getElementById('editor')
    if (editor) {
      html2canvas(editor, { scale: 2, useCORS: true, backgroundColor: 'hsl(var(--background))' }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save('chronicle-document.pdf')
      })
    }
  }

  const renderContent = () => (
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid grid-cols-7 bg-muted/80 h-12 px-1 backdrop-blur-sm transform transition-all hover:scale-105 border border-primary/20">
            <TabsTrigger value="font" aria-label="Font" className="transition-all transform hover:scale-110"><Type/></TabsTrigger>
            <TabsTrigger value="gamification" aria-label="Gamification" className="transition-all transform hover:scale-110"><BarChart/></TabsTrigger>
            <TabsTrigger value="word-goal" aria-label="Word Goal" className="transition-all transform hover:scale-110"><Target/></TabsTrigger>
            <TabsTrigger value="humanizer" aria-label="Humanizer" className="transition-all transform hover:scale-110"><Feather/></TabsTrigger>
            <TabsTrigger value="language" aria-label="Language" className="transition-all transform hover:scale-110"><Languages/></TabsTrigger>
            <TabsTrigger value="references" aria-label="References" className="transition-all transform hover:scale-110"><BookCheck/></TabsTrigger>
            <TabsTrigger value="view-text" aria-label="View Text" className="transition-all transform hover:scale-110"><FileText/></TabsTrigger>
        </TabsList>

        <TabsContent value="font" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            <div className="flex items-center gap-4 justify-center">
                <Select value={state.font} onValueChange={actions.onSetFont}>
                    <SelectTrigger className="bg-background w-48">
                        <SelectValue placeholder="Select Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="lora">Lora</SelectItem>
                        <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </TabsContent>

        <TabsContent value="gamification" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            <div className="flex justify-around text-center">
                <div>
                    <p className="text-2xl font-bold">{state.gamification.xp}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{state.gamification.streak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
            </div>
        </TabsContent>
        
        <TabsContent value="word-goal" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            <div className="flex items-center gap-4 justify-center">
                <div className="flex items-center gap-2">
                    <Input 
                    type="number" 
                    value={state.wordGoal}
                    onChange={(e) => dispatch({ type: 'SET_WORD_GOAL', payload: Number(e.target.value) })}
                    className="w-24 bg-background"
                    />
                    <span className="text-sm text-muted-foreground">words</span>
                </div>
                <div className="w-1/2">
                    <Progress value={(state.wordCount / state.wordGoal) * 100} />
                    <p className="text-sm text-center text-muted-foreground mt-1">{state.wordCount} / {state.wordGoal} words</p>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="humanizer" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-4 text-center">Select text in the editor to make it sound more natural.</p>
                <Button onClick={() => actions.onHumanize(state.selectedText)} disabled={!state.selectedText || state.aiLoading} className="w-full max-w-sm mx-auto transition-transform transform hover:scale-105">
                {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                Humanize Text
            </Button>
        </TabsContent>

        <TabsContent value="language" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-4 text-center">Translate selected text to an Indian language.</p>
                <div className="flex gap-4 justify-center">
                <Select value={language} onValueChange={(v: IndianLanguage) => setLanguage(v)}>
                    <SelectTrigger className="bg-background w-48">
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
                <Button onClick={() => actions.onTranslate(state.selectedText, language)} disabled={!state.selectedText || state.aiLoading} className="w-48 transition-transform transform hover:scale-105">
                    {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                    Translate Text
                </Button>
            </div>
        </TabsContent>

        <TabsContent value="references" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-4 text-center">Fetch academic references for the entire document.</p>
                <Button onClick={() => actions.onFetchReferences(state.editorContent)} disabled={state.aiLoading} className="w-full max-w-sm mx-auto transition-transform transform hover:scale-105">
                {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                Find References
            </Button>
        </TabsContent>

        <TabsContent value="view-text" className="p-4 mt-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
            {(state.aiResult || state.references.length > 0) ? (
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">AI Result</h4>
                    <ScrollArea className="h-24 w-full rounded-md border p-2 bg-background/50">
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
            )}
        </TabsContent>
    </Tabs>
  );

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20 p-2 flex items-center justify-between shadow-lg mb-2">
         <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Feather className="w-5 h-5 text-primary" />
            Chronicle AI
        </h1>
        <div className="flex-1 px-8">
            {renderContent()}
        </div>
        <div className="flex items-center gap-4">
             <Button onClick={handleExportPdf} variant="outline" size="sm">
                <Download className="mr-2" />
                Export
            </Button>
        </div>
      </div>
    </div>
  )
}
