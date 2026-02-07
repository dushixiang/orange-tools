import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import he from 'he';

interface HtmlEscapeState {
  input: string;
  output: string;
  mode: 'escape' | 'unescape';
}

export function HtmlEscapeTool() {
  const [state, setState] = useState<HtmlEscapeState>({
    input: '',
    output: '',
    mode: 'escape'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleProcess = useCallback(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, output: '' }));
      return;
    }

    const result = state.mode === 'escape' 
      ? he.encode(state.input, { useNamedReferences: true })
      : he.decode(state.input);

    setState(prev => ({ ...prev, output: result }));
  }, [state.input, state.mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleProcess();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleProcess]);

  const toggleMode = () => {
    setState(prev => ({
      mode: prev.mode === 'escape' ? 'unescape' : 'escape',
      input: prev.output || prev.input,
      output: ''
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const loadExample = () => {
    const examples = {
      escape: '<div class="container">\n  <p>Hello & Welcome!</p>\n  <a href="https://example.com?param=1&value=2">Link</a>\n</div>',
      unescape: '&lt;div class=&quot;container&quot;&gt;\n  &lt;p&gt;Hello &amp; Welcome!&lt;/p&gt;\n&lt;/div&gt;'
    };
    setState(prev => ({ ...prev, input: examples[prev.mode] }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Code2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">HTML 转义工具</CardTitle>
                <CardDescription className="mt-1">
                  HTML 实体编码/解码，安全处理特殊字符
                </CardDescription>
              </div>
            </div>
            <Badge variant={state.mode === 'escape' ? 'default' : 'secondary'} className="text-sm">
              {state.mode === 'escape' ? '转义' : '反转义'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={toggleMode} variant="outline">
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              切换到{state.mode === 'escape' ? '反转义' : '转义'}
            </Button>
            <Button onClick={loadExample} variant="outline">
              <Icons.FileText className="w-4 h-4 mr-2" />
              加载示例
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'escape' ? 'HTML 原文' : 'HTML 实体'}
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(state.input, 'input')}
                disabled={!state.input}
              >
                {copySuccess === 'input' ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={state.mode === 'escape' ? '输入 HTML 代码...' : '输入 HTML 实体...'}
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[250px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'escape' ? '转义结果' : '解码结果'}
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(state.output, 'output')}
                disabled={!state.output}
              >
                {copySuccess === 'output' ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="结果将显示在这里..."
              value={state.output}
              readOnly
              className="min-h-[250px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            常见 HTML 实体
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-mono">
            <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">&lt;</span> → &amp;lt;</div>
            <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">&gt;</span> → &amp;gt;</div>
            <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">&amp;</span> → &amp;amp;</div>
            <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">"</span> → &amp;quot;</div>
            <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">'</span> → &amp;apos;</div>
            <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">空格</span> → &amp;nbsp;</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
