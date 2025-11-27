'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { WritingStyleSchema, TranslateLanguageSchema } from '@/ai/schemas';
import type { WritingStyle, TranslateLanguage } from '@/ai/schemas';

interface AiToolsProps {
    type: 'rewrite' | 'style' | 'humanize' | 'translate' | 'references';
    state: any;
    actions: any;
    onDone: () => void;
}

export default function AiTools({ type, state, actions, onDone }: AiToolsProps) {
    const [rewriteLength, setRewriteLength] = useState(100);
    const [style, setStyle] = useState<WritingStyle>('Formal');
    const [language, setLanguage] = useState<TranslateLanguage>('Hindi');

    const handleRewrite = () => {
        actions.onRewrite(rewriteLength);
        onDone();
    }

    const handleStyleChange = () => {
        actions.onChangeStyle(style);
        onDone();
    }
    
    const handleHumanize = () => {
        actions.onHumanize();
        onDone();
    }

    const handleTranslate = () => {
        actions.onTranslate(language);
        onDone();
    }
    
    const handleFetchReferences = () => {
        actions.onFetchReferences();
        onDone();
    }

    const renderContent = () => {
        switch (type) {
            case 'rewrite':
                return (
                    <div className="flex flex-col gap-4">
                        <Label htmlFor="rewrite-length">Target Word Count</Label>
                        <Input 
                            id="rewrite-length"
                            type="number"
                            value={rewriteLength}
                            onChange={(e) => setRewriteLength(parseInt(e.target.value))}
                            className="bg-secondary"
                        />
                        <Button onClick={handleRewrite} disabled={state.isAiLoading}>
                            {state.isAiLoading ? 'Rewriting...' : 'Rewrite'}
                        </Button>
                    </div>
                )
            case 'style':
                return (
                    <div className="flex flex-col gap-4">
                        <Label>Select Style</Label>
                        <Select value={style} onValueChange={(val: WritingStyle) => setStyle(val)}>
                            <SelectTrigger className="bg-secondary">
                                <SelectValue placeholder="Select writing style" />
                            </SelectTrigger>
                            <SelectContent>
                                {WritingStyleSchema.options.map((style) => (
                                    <SelectItem key={style} value={style}>{style}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleStyleChange} disabled={state.isAiLoading}>
                            {state.isAiLoading ? 'Changing...' : 'Change Style'}
                        </Button>
                    </div>
                )
            case 'humanize':
                return (
                    <div className="flex flex-col gap-4 items-center">
                        <p className="text-sm text-muted-foreground">Make the selected text sound more natural and less robotic.</p>
                        <Button onClick={handleHumanize} disabled={state.isAiLoading}>
                            {state.isAiLoading ? 'Humanizing...' : 'Humanize Text'}
                        </Button>
                    </div>
                )
            case 'translate':
                return (
                    <div className="flex flex-col gap-4">
                        <Label>Select Language</Label>
                        <Select value={language} onValueChange={(val: TranslateLanguage) => setLanguage(val)}>
                            <SelectTrigger className="bg-secondary">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                {TranslateLanguageSchema.options.map((lang) => (
                                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleTranslate} disabled={state.isAiLoading}>
                            {state.isAiLoading ? 'Translating...' : 'Translate'}
                        </Button>
                    </div>
                )
            case 'references':
                return (
                    <div className="flex flex-col gap-4 items-center">
                        <p className="text-sm text-muted-foreground">Find academic references for the claims made in the selected text.</p>
                        <Button onClick={handleFetchReferences} disabled={state.isAiLoading}>
                            {state.isAiLoading ? 'Fetching...' : 'Fetch References'}
                        </Button>
                    </div>
                )
            default:
                return null;
        }
    }
    
    return <div>{renderContent()}</div>;
}
