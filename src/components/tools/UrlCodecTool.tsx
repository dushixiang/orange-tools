import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface UrlCodecToolState {
  input: string;
  output: string;
  mode: 'encode' | 'decode';
  error?: string;
}

export function UrlCodecTool() {
  const [state, setState] = useState<UrlCodecToolState>({
    input: '',
    output: '',
    mode: 'encode'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // URL编码函数
  const encodeUrl = useCallback((text: string): string => {
    try {
      if (!text) return '';
      return encodeURIComponent(text);
    } catch (error) {
      throw new Error('编码失败：输入包含无效字符');
    }
  }, []);

  // URL解码函数
  const decodeUrl = useCallback((text: string): string => {
    try {
      if (!text) return '';
      return decodeURIComponent(text);
    } catch (error) {
      throw new Error('解码失败：无效的URL编码格式');
    }
  }, []);

  // 处理转换
  const handleConvert = useCallback(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, output: '', error: undefined }));
      return;
    }

    try {
      let result: string;
      if (state.mode === 'encode') {
        result = encodeUrl(state.input);
      } else {
        result = decodeUrl(state.input);
      }

      setState(prev => ({
        ...prev,
        output: result,
        error: undefined
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        output: '',
        error: error instanceof Error ? error.message : '转换失败'
      }));
    }
  }, [state.input, state.mode, encodeUrl, decodeUrl]);

  // 实时转换
  useEffect(() => {
    const timer = setTimeout(() => {
      handleConvert();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleConvert]);

  // 切换模式
  const toggleMode = () => {
    setState(prev => {
      const newMode = prev.mode === 'encode' ? 'decode' : 'encode';
      return {
        mode: newMode,
        input: prev.output || prev.input,
        output: '',
        error: undefined
      };
    });
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: 'input' | 'output') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 清空内容
  const clearAll = () => {
    setState({
      input: '',
      output: '',
      mode: state.mode,
      error: undefined
    });
  };

  // 示例数据
  const loadExample = () => {
    const examples = {
      encode: 'https://example.com/search?q=你好世界&category=编程&tags=JavaScript, React',
      decode: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3D%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C%26category%3D%E7%BC%96%E7%A8%8B'
    };

    setState(prev => ({
      ...prev,
      input: examples[prev.mode],
      error: undefined
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Link className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">URL 编码/解码工具</CardTitle>
                <CardDescription className="mt-1">
                  对URL参数进行编码和解码，处理特殊字符，确保URL正确传输
                </CardDescription>
              </div>
            </div>
            <Badge variant={state.mode === 'encode' ? 'default' : 'secondary'} className="text-sm">
              {state.mode === 'encode' ? '编码模式' : '解码模式'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={toggleMode} variant="outline">
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              切换到{state.mode === 'encode' ? '解码' : '编码'}模式
            </Button>
            <Button onClick={loadExample} variant="outline">
              <Icons.FileText className="w-4 h-4 mr-2" />
              加载示例
            </Button>
            <Button onClick={clearAll} variant="outline">
              <Icons.Trash2 className="w-4 h-4 mr-2" />
              清空内容
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主要工作区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'encode' ? '原始URL' : '编码后的URL'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.input, 'input')}
                  disabled={!state.input}
                >
                  {copySuccess === 'input' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={state.mode === 'encode'
                ? '请输入要编码的URL或文本...'
                : '请输入要解码的URL编码文本...'
              }
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {state.input.length}
            </div>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'encode' ? '编码结果' : '解码结果'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.output, 'output')}
                  disabled={!state.output}
                >
                  {copySuccess === 'output' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="转换结果将显示在这里..."
              value={state.output}
              readOnly
              className={`min-h-[200px] font-mono text-sm ${
                state.error ? 'border-destructive' : ''
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {state.output && `字符数: ${state.output.length}`}
              </div>
              {state.error && (
                <div className="text-xs text-destructive flex items-center">
                  <Icons.AlertCircle className="w-3 h-3 mr-1" />
                  {state.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">URL编码说明</h4>
              <ul className="space-y-1">
                <li>• <strong>编码：</strong>将URL中的特殊字符转换为 %XX 格式</li>
                <li>• <strong>解码：</strong>将 %XX 格式还原为原始字符</li>
                <li>• 空格编码为 %20</li>
                <li>• 中文字符会被编码为多个 %XX 序列</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• URL参数传递中文内容</li>
                <li>• 处理包含特殊字符的链接</li>
                <li>• API接口参数编码</li>
                <li>• 浏览器地址栏URL处理</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：URL编码遵循 RFC 3986 标准，将不安全字符转换为百分号编码格式。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
