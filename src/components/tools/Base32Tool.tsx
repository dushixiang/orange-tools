import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Base64ToolState } from '@/types/tool';
import * as Icons from 'lucide-react';

// Base32 字符集 (RFC 4648 标准)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function Base32Tool() {
  const [state, setState] = useState<Base64ToolState>({
    input: '',
    output: '',
    mode: 'encode'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // Base32编码函数
  const encodeBase32 = useCallback((text: string): string => {
    try {
      if (!text) return '';
      
      const bytes = new TextEncoder().encode(text);
      let result = '';
      let buffer = 0;
      let bitsLeft = 0;
      
      for (let i = 0; i < bytes.length; i++) {
        buffer = (buffer << 8) | bytes[i];
        bitsLeft += 8;
        
        while (bitsLeft >= 5) {
          const index = (buffer >> (bitsLeft - 5)) & 0x1F;
          result += BASE32_ALPHABET[index];
          bitsLeft -= 5;
        }
      }
      
      if (bitsLeft > 0) {
        const index = (buffer << (5 - bitsLeft)) & 0x1F;
        result += BASE32_ALPHABET[index];
      }
      
      // 添加填充字符
      while (result.length % 8 !== 0) {
        result += '=';
      }
      
      return result;
    } catch (error) {
      throw new Error('编码失败：输入包含无效字符');
    }
  }, []);

  // Base32解码函数
  const decodeBase32 = useCallback((base32: string): string => {
    try {
      if (!base32) return '';
      
      // 移除填充字符和空白字符
      const cleanBase32 = base32.replace(/[=\s]/g, '').toUpperCase();
      
      // 验证Base32字符
      for (let i = 0; i < cleanBase32.length; i++) {
        if (BASE32_ALPHABET.indexOf(cleanBase32[i]) === -1) {
          throw new Error(`无效的Base32字符: ${cleanBase32[i]}`);
        }
      }
      
      const bytes: number[] = [];
      let buffer = 0;
      let bitsLeft = 0;
      
      for (let i = 0; i < cleanBase32.length; i++) {
        const value = BASE32_ALPHABET.indexOf(cleanBase32[i]);
        buffer = (buffer << 5) | value;
        bitsLeft += 5;
        
        if (bitsLeft >= 8) {
          bytes.push((buffer >> (bitsLeft - 8)) & 0xFF);
          bitsLeft -= 8;
        }
      }
      
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch (error) {
      throw new Error('解码失败：' + (error instanceof Error ? error.message : '无效的Base32字符串'));
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
        result = encodeBase32(state.input);
      } else {
        result = decodeBase32(state.input);
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
  }, [state.input, state.mode, encodeBase32, decodeBase32]);

  // 实时转换
  useEffect(() => {
    const timer = setTimeout(() => {
      handleConvert();
    }, 300); // 防抖处理

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
      encode: 'Hello, Base32! 这是一个Base32编码示例，常用于TOTP。',
      decode: 'JBSWY3DPFQQFO33SNRSCC='
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
                <Icons.Key className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Base32 编码/解码工具</CardTitle>
                <CardDescription className="mt-1">
                  支持文本的Base32编码和解码，采用RFC 4648标准，常用于TOTP、二维码等场景
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
                {state.mode === 'encode' ? '原始文本' : 'Base32字符串'}
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
                ? '请输入要编码的文本...' 
                : '请输入要解码的Base32字符串...'
              }
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {state.input.length}
              {state.mode === 'encode' && state.input && (
                <span className="ml-4">
                  字节数: {new TextEncoder().encode(state.input).length}
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
                {state.mode === 'encode' ? 'Base32结果' : '解码结果'}
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
                {state.output && (
                  <>
                    字符数: {state.output.length}
                    {state.mode === 'decode' && (
                      <span className="ml-4">
                        字节数: {new TextEncoder().encode(state.output).length}
                      </span>
                    )}
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
              <h4 className="font-medium text-foreground mb-2">Base32编码特点</h4>
              <ul className="space-y-1">
                <li>• 使用32个字符：A-Z和2-7</li>
                <li>• 大小写不敏感（通常使用大写）</li>
                <li>• 使用'='作为填充字符</li>
                <li>• 编码结果比Base64长约25%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• TOTP（时间基础一次性密码）</li>
                <li>• 二维码数据编码</li>
                <li>• DNS记录（如NSEC3）</li>
                <li>• 需要语音传输的场景</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：Base32编码只使用字母和数字，避免了特殊字符，适合在各种系统间传输数据。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
