import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Base64ToolState } from '@/types/tool';
import * as Icons from 'lucide-react';

// Base58 字符集 (Bitcoin/IPFS 标准)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function Base58Tool() {
  const [state, setState] = useState<Base64ToolState>({
    input: '',
    output: '',
    mode: 'encode'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // Base58编码函数
  const encodeBase58 = useCallback((text: string): string => {
    try {
      if (!text) return '';
      
      // 将字符串转换为字节数组
      const bytes = new TextEncoder().encode(text);
      
      // 处理前导零字节
      let leadingZeros = 0;
      for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        leadingZeros++;
      }
      
      // 转换为大整数进行Base58编码
      let num = BigInt(0);
      for (let i = 0; i < bytes.length; i++) {
        num = num * BigInt(256) + BigInt(bytes[i]);
      }
      
      // 转换为Base58
      let result = '';
      while (num > 0) {
        const remainder = Number(num % BigInt(58));
        result = BASE58_ALPHABET[remainder] + result;
        num = num / BigInt(58);
      }
      
      // 添加前导零对应的'1'字符
      return '1'.repeat(leadingZeros) + result;
    } catch (error) {
      throw new Error('编码失败：输入包含无效字符');
    }
  }, []);

  // Base58解码函数
  const decodeBase58 = useCallback((base58: string): string => {
    try {
      if (!base58) return '';
      
      // 验证Base58字符
      for (let i = 0; i < base58.length; i++) {
        if (BASE58_ALPHABET.indexOf(base58[i]) === -1) {
          throw new Error(`无效的Base58字符: ${base58[i]}`);
        }
      }
      
      // 计算前导'1'的数量
      let leadingOnes = 0;
      for (let i = 0; i < base58.length && base58[i] === '1'; i++) {
        leadingOnes++;
      }
      
      // 转换为大整数
      let num = BigInt(0);
      for (let i = 0; i < base58.length; i++) {
        const charIndex = BASE58_ALPHABET.indexOf(base58[i]);
        num = num * BigInt(58) + BigInt(charIndex);
      }
      
      // 转换为字节数组
      const bytes: number[] = [];
      while (num > 0) {
        bytes.unshift(Number(num % BigInt(256)));
        num = num / BigInt(256);
      }
      
      // 添加前导零字节
      for (let i = 0; i < leadingOnes; i++) {
        bytes.unshift(0);
      }
      
      // 转换为字符串
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch (error) {
      throw new Error('解码失败：' + (error instanceof Error ? error.message : '无效的Base58字符串'));
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
        result = encodeBase58(state.input);
      } else {
        result = decodeBase58(state.input);
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
  }, [state.input, state.mode, encodeBase58, decodeBase58]);

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
      encode: 'Hello, Base58! 这是一个Base58编码示例。',
      decode: '2NEpo7TZRhna7vSvL6GNtWnyd2yt2junTa'
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
                <Icons.Hash className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Base58 编码/解码工具</CardTitle>
                <CardDescription className="mt-1">
                  支持文本的Base58编码和解码，采用Bitcoin标准字符集，常用于加密货币地址编码
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
                {state.mode === 'encode' ? '原始文本' : 'Base58字符串'}
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
                : '请输入要解码的Base58字符串...'
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
                {state.mode === 'encode' ? 'Base58结果' : '解码结果'}
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
              <h4 className="font-medium text-foreground mb-2">Base58编码特点</h4>
              <ul className="space-y-1">
                <li>• 使用58个字符：123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz</li>
                <li>• 避免了容易混淆的字符：0、O、I、l</li>
                <li>• 常用于比特币地址、IPFS哈希等</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• 加密货币地址编码</li>
                <li>• 分布式存储系统标识符</li>
                <li>• 需要人工输入的短标识符</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：Base58编码结果比Base64更短，且避免了易混淆字符，适合需要手动输入的场景。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
