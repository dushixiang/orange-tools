import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as Icons from 'lucide-react';

export function TextCaseTool() {
  const [input, setInput] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const transformations = [
    { name: '大写', fn: (s: string) => s.toUpperCase(), icon: Icons.ArrowBigUp },
    { name: '小写', fn: (s: string) => s.toLowerCase(), icon: Icons.ArrowBigDown },
    { name: '首字母大写', fn: (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()), icon: Icons.Type },
    { name: '驼峰式', fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()), icon: Icons.Waves },
    { name: '蛇形', fn: (s: string) => s.toLowerCase().replace(/\s+/g, '_'), icon: Icons.Minus },
    { name: '短横线', fn: (s: string) => s.toLowerCase().replace(/\s+/g, '-'), icon: Icons.Minus },
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.CaseSensitive className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">文本大小写转换</CardTitle>
              <CardDescription className="mt-1">
                大写、小写、驼峰式、蛇形等多种格式转换
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">输入文本</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="输入要转换的文本..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transformations.map((transform) => {
          const Icon = transform.icon;
          const result = transform.fn(input);
          return (
            <Card key={transform.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {transform.name}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(result, transform.name)}
                    disabled={!input}
                  >
                    {copySuccess === transform.name ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted/30 rounded-lg min-h-[60px] font-mono text-sm break-words">
                  {result || '...'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
