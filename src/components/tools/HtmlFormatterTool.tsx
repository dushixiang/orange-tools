import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface HtmlFormatterState {
  input: string;
  output: string;
  mode: 'format' | 'minify' | 'validate';
  error?: string;
  isValid?: boolean;
}

export function HtmlFormatterTool() {
  const [state, setState] = useState<HtmlFormatterState>({
    input: '',
    output: '',
    mode: 'format'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // HTML格式化函数
  const formatHtml = useCallback((htmlString: string): string => {
    try {
      if (!htmlString.trim()) return '';
      
      // 简单的HTML格式化
      let formatted = htmlString
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/gm, ''); // 移除每行首尾空白
      
      const lines = formatted.split('\n').filter(line => line.trim());
      let indentLevel = 0;
      const result: string[] = [];
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
      
      for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // 处理结束标签
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        result.push('  '.repeat(indentLevel) + trimmed);
        
        // 处理开始标签（非自闭合）
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          const tagMatch = trimmed.match(/<(\w+)/);
          if (tagMatch) {
            const tagName = tagMatch[1].toLowerCase();
            if (!selfClosingTags.includes(tagName) && !trimmed.includes(`</${tagName}>`)) {
              indentLevel++;
            }
          }
        }
      }
      
      return result.join('\n');
    } catch (error) {
      throw new Error('HTML格式化失败');
    }
  }, []);

  // HTML压缩函数
  const minifyHtml = useCallback((htmlString: string): string => {
    try {
      return htmlString
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .replace(/\s+>/g, '>')
        .replace(/>\s+/g, '>')
        .trim();
    } catch (error) {
      throw new Error('HTML压缩失败');
    }
  }, []);

  // HTML验证函数
  const validateHtml = useCallback((htmlString: string): { isValid: boolean; message: string } => {
    try {
      if (!htmlString.trim()) {
        return { isValid: false, message: 'HTML内容为空' };
      }
      
      // 基本的HTML语法检查
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      
      // 检查是否有解析错误
      const parseErrors = doc.querySelectorAll('parsererror');
      if (parseErrors.length > 0) {
        return { isValid: false, message: 'HTML格式错误' };
      }
      
      // 简单的标签匹配检查
      const openTags = htmlString.match(/<[^/][^>]*>/g) || [];
      const closeTags = htmlString.match(/<\/[^>]*>/g) || [];
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
      
      let unclosedTags = 0;
      for (let tag of openTags) {
        const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
        if (tagName && !selfClosingTags.includes(tagName) && !tag.endsWith('/>')) {
          unclosedTags++;
        }
      }
      
      if (unclosedTags !== closeTags.length) {
        return { isValid: false, message: '标签未正确闭合' };
      }
      
      return { isValid: true, message: 'HTML格式正确' };
    } catch (error) {
      return { isValid: false, message: '无效的HTML格式' };
    }
  }, []);

  // 处理转换
  const handleProcess = useCallback(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, output: '', error: undefined, isValid: undefined }));
      return;
    }

    try {
      let result: string;
      let isValid = true;
      
      switch (state.mode) {
        case 'format':
          result = formatHtml(state.input);
          break;
        case 'minify':
          result = minifyHtml(state.input);
          break;
        case 'validate':
          const validation = validateHtml(state.input);
          isValid = validation.isValid;
          result = validation.isValid ? '✅ HTML格式正确' : `❌ ${validation.message}`;
          break;
        default:
          result = state.input;
      }
      
      setState(prev => ({ 
        ...prev, 
        output: result, 
        error: undefined,
        isValid 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        output: '', 
        error: error instanceof Error ? error.message : '处理失败',
        isValid: false
      }));
    }
  }, [state.input, state.mode, formatHtml, minifyHtml, validateHtml]);

  // 实时处理
  useEffect(() => {
    const timer = setTimeout(() => {
      handleProcess();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleProcess]);

  // 设置模式
  const setMode = (mode: 'format' | 'minify' | 'validate') => {
    setState(prev => ({
      ...prev,
      mode,
      output: '',
      error: undefined,
      isValid: undefined
    }));
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
    setState(prev => ({
      input: '',
      output: '',
      mode: prev.mode,
      error: undefined,
      isValid: undefined
    }));
  };

  // 示例数据
  const loadExample = () => {
    const example = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>示例页面</title>
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
.container { max-width: 800px; margin: 0 auto; }
h1 { color: #333; }
</style>
</head>
<body>
<div class="container">
<h1>欢迎来到示例页面</h1>
<p>这是一个HTML格式化工具的示例。</p>
<ul>
<li>支持HTML格式化</li>
<li>支持HTML压缩</li>
<li>支持HTML验证</li>
</ul>
<img src="example.jpg" alt="示例图片">
<br>
<a href="https://example.com">访问示例网站</a>
</div>
</body>
</html>`;
    
    setState(prev => ({
      ...prev,
      input: example,
      error: undefined,
      isValid: undefined
    }));
  };

  const getModeDescription = () => {
    switch (state.mode) {
      case 'format':
        return '格式化HTML，使其更易读';
      case 'minify':
        return '压缩HTML，移除空白字符';
      case 'validate':
        return '验证HTML格式正确性';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">HTML 格式化工具</CardTitle>
                <CardDescription className="mt-1">
                  {getModeDescription()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {state.mode.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setMode('format')} 
              variant={state.mode === 'format' ? 'default' : 'outline'}
            >
              <Icons.AlignLeft className="w-4 h-4 mr-2" />
              格式化
            </Button>
            <Button 
              onClick={() => setMode('minify')} 
              variant={state.mode === 'minify' ? 'default' : 'outline'}
            >
              <Icons.Minimize2 className="w-4 h-4 mr-2" />
              压缩
            </Button>
            <Button 
              onClick={() => setMode('validate')} 
              variant={state.mode === 'validate' ? 'default' : 'outline'}
            >
              <Icons.CheckCircle className="w-4 h-4 mr-2" />
              验证
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
              <CardTitle className="text-lg">HTML 输入</CardTitle>
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
              placeholder="请输入HTML代码..."
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {state.input.length}
              {state.input && (
                <span className="ml-4">
                  行数: {state.input.split('\n').length}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'format' && 'HTML 格式化结果'}
                {state.mode === 'minify' && 'HTML 压缩结果'}
                {state.mode === 'validate' && '验证结果'}
              </CardTitle>
              <div className="flex gap-2">
                {state.isValid !== undefined && (
                  <Badge variant={state.isValid ? 'default' : 'destructive'} className="text-xs">
                    {state.isValid ? '有效' : '无效'}
                  </Badge>
                )}
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
              placeholder="处理结果将显示在这里..."
              value={state.output}
              readOnly
              className={`min-h-[300px] font-mono text-sm ${
                state.error ? 'border-destructive' : ''
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {state.output && (
                  <>
                    字符数: {state.output.length}
                    <span className="ml-4">
                      行数: {state.output.split('\n').length}
                    </span>
                  </>
                )}
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
              <h4 className="font-medium text-foreground mb-2">HTML特点</h4>
              <ul className="space-y-1">
                <li>• 超文本标记语言</li>
                <li>• 使用标签定义网页结构</li>
                <li>• 支持嵌套和属性</li>
                <li>• 大小写不敏感（推荐小写）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• 网页开发</li>
                <li>• 邮件模板</li>
                <li>• 文档生成</li>
                <li>• 移动应用内嵌页面</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：HTML是构建网页的基础语言，良好的格式化有助于代码维护和调试。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
