import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as Icons from 'lucide-react';
import { loremIpsum } from 'lorem-ipsum';

export function LoremIpsumTool() {
  const [count, setCount] = useState(5);
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [output, setOutput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generate = () => {
    const text = loremIpsum({
      count,
      units: unit,
      format: 'plain',
      sentenceLowerBound: 5,
      sentenceUpperBound: 15
    });
    setOutput(text);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
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
              <Icons.Type className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Lorem Ipsum 生成器</CardTitle>
              <CardDescription className="mt-1">
                生成占位文本，用于设计和开发测试
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">数量</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">单位</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="paragraphs">段落</option>
                <option value="sentences">句子</option>
                <option value="words">单词</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={generate} className="w-full">
                <Icons.Sparkles className="w-4 h-4 mr-2" />
                生成文本
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">生成结果</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copySuccess ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="点击生成按钮生成占位文本..."
            value={output}
            readOnly
            className="min-h-[300px]"
          />
          <div className="mt-2 text-xs text-muted-foreground">
            字符数: {output.length} | 单词数: {output.split(/\s+/).filter(Boolean).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
