import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface XmlFormatterState {
  input: string;
  output: string;
  mode: 'format' | 'minify' | 'validate';
  error?: string;
  isValid?: boolean;
}

export function XmlFormatterTool() {
  const [state, setState] = useState<XmlFormatterState>({
    input: '',
    output: '',
    mode: 'format'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // XML格式化函数
  const formatXml = useCallback((xmlString: string): string => {
    try {
      if (!xmlString.trim()) return '';
      
      // 简单的XML格式化
      let formatted = xmlString.replace(/></g, '>\n<');
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const result: string[] = [];
      
      for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // 处理结束标签
        if (trimmed.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        result.push('  '.repeat(indentLevel) + trimmed);
        
        // 处理开始标签（非自闭合）
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('<?')) {
          indentLevel++;
        }
      }
      
      return result.join('\n');
    } catch (error) {
      throw new Error('XML格式化失败');
    }
  }, []);

  // XML压缩函数
  const minifyXml = useCallback((xmlString: string): string => {
    try {
      return xmlString
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      throw new Error('XML压缩失败');
    }
  }, []);

  // XML验证函数
  const validateXml = useCallback((xmlString: string): { isValid: boolean; message: string } => {
    try {
      if (!xmlString.trim()) {
        return { isValid: false, message: 'XML内容为空' };
      }
      
      // 基本的XML语法检查
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      
      if (parseError) {
        return { isValid: false, message: parseError.textContent || 'XML格式错误' };
      }
      
      return { isValid: true, message: 'XML格式正确' };
    } catch (error) {
      return { isValid: false, message: '无效的XML格式' };
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
          result = formatXml(state.input);
          break;
        case 'minify':
          result = minifyXml(state.input);
          break;
        case 'validate':
          const validation = validateXml(state.input);
          isValid = validation.isValid;
          result = validation.isValid ? '✅ XML格式正确' : `❌ ${validation.message}`;
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
  }, [state.input, state.mode, formatXml, minifyXml, validateXml]);

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
    const example = `<?xml version="1.0" encoding="UTF-8"?>
<person>
<name>张三</name>
<age>30</age>
<city>北京</city>
<hobbies>
<hobby>阅读</hobby>
<hobby>旅行</hobby>
<hobby>编程</hobby>
</hobbies>
<address>
<street>中关村大街</street>
<number>123</number>
<zipCode>100080</zipCode>
</address>
<isActive>true</isActive>
<balance>1234.56</balance>
</person>`;
    
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
        return '格式化XML，使其更易读';
      case 'minify':
        return '压缩XML，移除空白字符';
      case 'validate':
        return '验证XML格式正确性';
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
                <Icons.Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">XML 格式化工具</CardTitle>
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
              <CardTitle className="text-lg">XML 输入</CardTitle>
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
              placeholder="请输入XML数据..."
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
                {state.mode === 'format' && 'XML 格式化结果'}
                {state.mode === 'minify' && 'XML 压缩结果'}
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
              <h4 className="font-medium text-foreground mb-2">XML特点</h4>
              <ul className="space-y-1">
                <li>• 标记语言，使用标签定义数据</li>
                <li>• 必须有根元素</li>
                <li>• 标签必须正确嵌套和关闭</li>
                <li>• 大小写敏感</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• 配置文件</li>
                <li>• 数据交换格式</li>
                <li>• Web服务（SOAP）</li>
                <li>• 文档存储</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：XML是一种标记语言，广泛用于数据存储和传输，具有良好的可读性和扩展性。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
