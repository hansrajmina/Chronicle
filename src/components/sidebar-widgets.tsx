"use client"

import React from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart, Download, Feather, Languages, Loader2, Sparkles, Target, BookCheck, FileText } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'

type IndianLanguage = 'Hindi' | 'Tamil' | 'Bengali' | 'Telugu' | 'Marathi' | 'Urdu';

const WidgetCard = ({ title, icon, children, cardClassName }: { title: string, icon: React.ReactNode, children: React.ReactNode, cardClassName?: string }) => (
  <Card className={`border-2 border-sidebar-border bg-sidebar-accent/20 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/50 ${cardClassName}`}>
    <CardHeader className="p-4 bg-sidebar-accent/30">
      <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sidebar-foreground/80">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      {children}
    </CardContent>
  </Card>
);


export default function SidebarWidgets({ state, dispatch, actions }: { state: any, dispatch: any, actions: any }) {
  const [language, setLanguage] = React.useState<IndianLanguage>('Hindi');
  
  const handleExportPdf = () => {
    const editor = document.getElementById('editor')
    if (editor) {
      html2canvas(editor, { scale: 2, backgroundColor: '#030014' }).then((canvas) => {
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
        <TabsList className="grid w-full grid-cols-7 bg-sidebar-accent/30 h-12 px-1">
          <TabsTrigger value="actions" aria-label="Actions"><Sparkles/></TabsTrigger>
          <TabsTrigger value="gamification" aria-label="Gamification"><BarChart/></TabsTrigger>
          <TabsTrigger value="word-goal" aria-label="Word Goal"><Target/></TabsTrigger>
          <TabsTrigger value="humanizer" aria-label="Humanizer"><Feather/></TabsTrigger>
          <TabsTrigger value="language" aria-label="Language"><Languages/></TabsTrigger>
          <TabsTrigger value="references" aria-label="References"><BookCheck/></TabsTrigger>
          <TabsTrigger value="view-text" aria-label="View Text"><FileText/></TabsTrigger>
        </TabsList>

        <div className="p-4">
            <TabsContent value="actions">
                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={actions.onContinueWriting} disabled={state.aiLoading} className="w-full">
                        {state.aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                        Continue Writing
                    </Button>
                    <Button onClick={handleExportPdf} variant="secondary" className="w-full">
                        <Download className="mr-2" />
                        Export as PDF
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="gamification">
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
            
            <TabsContent value="word-goal">
                <div className="flex items-center gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <Input 
                        type="number" 
                        value={state.wordGoal}
                        onChange={(e) => dispatch({ type: 'SET_WORD_GOAL', payload: Number(e.target.value) })}
                        className="w-24 bg-sidebar-background"
                        />
                        <span className="text-sm text-muted-foreground">words</span>
                    </div>
                    <div className="w-1/2">
                        <Progress value={(state.wordCount / state.wordGoal) * 100} />
                        <p className="text-sm text-center text-muted-foreground mt-1">{state.wordCount} / {state.wordGoal} words</p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="humanizer">
                <p className="text-sm text-muted-foreground mb-4 text-center">Select text in the editor to make it sound more natural.</p>
                    <Button onClick={() => actions.onHumanize(state.selectedText)} disabled={!state.selectedText || state.aiLoading} className="w-full max-w-sm mx-auto">
                    {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                    Humanize Text
                </Button>
            </TabsContent>

            <TabsContent value="language">
                <p className="text-sm text-muted-foreground mb-4 text-center">Translate selected text to an Indian language.</p>
                    <div className="flex gap-4 justify-center">
                    <Select value={language} onValueChange={(v: IndianLanguage) => setLanguage(v)}>
                        <SelectTrigger className="bg-sidebar-background w-48">
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
                    <Button onClick={() => actions.onTranslate(state.selectedText, language)} disabled={!state.selectedText || state.aiLoading} className="w-48">
                        {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                        Translate Text
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="references">
                <p className="text-sm text-muted-foreground mb-4 text-center">Fetch academic references for the entire document.</p>
                    <Button onClick={() => actions.onFetchReferences(state.editorContent)} disabled={state.aiLoading} className="w-full max-w-sm mx-auto">
                    {state.aiLoading && <Loader2 className="animate-spin mr-2" />}
                    Find References
                </Button>
            </TabsContent>

            <TabsContent value="view-text">
                {(state.aiResult || state.references.length > 0) ? (
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">AI Result</h4>
                        <ScrollArea className="h-24 w-full rounded-md border border-sidebar-border p-2 bg-sidebar-background/50">
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
        </div>
    </Tabs>
  );

  return (
    <>
      <div className="md:hidden">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 p-0 bg-primary/80 border-primary text-primary-foreground hover:bg-primary">
                    <Sparkles />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-sidebar text-sidebar-foreground border-sidebar-border max-h-[80vh]">
                <SheetHeader>
                    <SheetTitle>Chronicle Tools</SheetTitle>
                    <SheetDescription>AI-powered writing assistance.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-full">
                    <div className="p-4">{renderContent()}</div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t-2 border-primary/20 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.2)]">
        {renderContent()}
      </div>
    </>
  )
}
