import {useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {MonacoDiffEditor} from 'react-monaco-editor';
import * as Icons from 'lucide-react';

export function DiffTool() {
    const [original, setOriginal] = useState<string>('');
    const [modified, setModified] = useState<string>('');
    const [language, setLanguage] = useState<string>('plaintext');
    const [theme, setTheme] = useState<'vs' | 'vs-dark'>('vs');

    const editorOptions = useMemo(() => ({
        renderSideBySide: true,
        readOnly: true,
        originalEditable: false,
        automaticLayout: true,
        wordWrap: 'on' as const,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
    }), []);

    const detectLanguage = (text: string): string => {
        try {
            JSON.parse(text);
            return 'json';
        } catch {}
        if (/^<[^>]+>/.test(text.trim())) return 'xml';
        if (/^\s*\{[\s\S]*\}\s*$/.test(text.trim())) return 'json';
        if (/^\s*\w+\s*:\s*[\s\S]+/m.test(text)) return 'yaml';
        return 'plaintext';
    };

    const handleAutoDetect = () => {
        const lang = detectLanguage(original) || detectLanguage(modified);
        setLanguage(lang);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Icons.GitCompare className="w-6 h-6 text-primary"/>
                            <div>
                                <CardTitle>文本 Diff 对比</CardTitle>
                                <CardDescription>支持左右对比、换行、主题切换与语言高亮</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setTheme(t => t === 'vs' ? 'vs-dark' : 'vs')}>
                                <Icons.SunMoon className="w-4 h-4 mr-2"/>
                                切换主题
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleAutoDetect}>
                                <Icons.WandSparkles className="w-4 h-4 mr-2"/>
                                自动识别语言
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">原始文本</div>
                            <Textarea
                                className="min-h-40"
                                value={original}
                                onChange={(e) => setOriginal(e.target.value)}
                                placeholder="在此粘贴原始文本"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">修改后文本</div>
                            <Textarea
                                className="min-h-40"
                                value={modified}
                                onChange={(e) => setModified(e.target.value)}
                                placeholder="在此粘贴修改后文本"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <label className="text-sm text-muted-foreground">语言：</label>
                        <select
                            className="border rounded-md px-2 py-1 bg-background"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="plaintext">Plain Text</option>
                            <option value="json">JSON</option>
                            <option value="yaml">YAML</option>
                            <option value="xml">XML</option>
                            <option value="html">HTML</option>
                            <option value="markdown">Markdown</option>
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="css">CSS</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>对比结果</CardTitle>
                    <CardDescription>仅展示对比结果，不可直接编辑（避免误操作）</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[480px]">
                        <MonacoDiffEditor
                            original={original}
                            value={modified}
                            language={language}
                            theme={theme}
                            options={editorOptions}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DiffTool;


