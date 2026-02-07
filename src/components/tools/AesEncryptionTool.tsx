import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import CryptoJS from 'crypto-js';

interface AesState {
  input: string;
  output: string;
  key: string;
  mode: 'encrypt' | 'decrypt';
  algorithm: 'AES' | 'DES' | 'TripleDES';
  error?: string;
}

export function AesEncryptionTool() {
  const [state, setState] = useState<AesState>({
    input: '',
    output: '',
    key: '',
    mode: 'encrypt',
    algorithm: 'AES'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleProcess = useCallback(() => {
    if (!state.input.trim() || !state.key.trim()) {
      setState(prev => ({ ...prev, output: '', error: undefined }));
      return;
    }

    try {
      let result: string;
      
      if (state.mode === 'encrypt') {
        switch (state.algorithm) {
          case 'AES':
            result = CryptoJS.AES.encrypt(state.input, state.key).toString();
            break;
          case 'DES':
            result = CryptoJS.DES.encrypt(state.input, state.key).toString();
            break;
          case 'TripleDES':
            result = CryptoJS.TripleDES.encrypt(state.input, state.key).toString();
            break;
          default:
            result = '';
        }
      } else {
        switch (state.algorithm) {
          case 'AES':
            const decryptedAES = CryptoJS.AES.decrypt(state.input, state.key);
            result = decryptedAES.toString(CryptoJS.enc.Utf8);
            break;
          case 'DES':
            const decryptedDES = CryptoJS.DES.decrypt(state.input, state.key);
            result = decryptedDES.toString(CryptoJS.enc.Utf8);
            break;
          case 'TripleDES':
            const decryptedTripleDES = CryptoJS.TripleDES.decrypt(state.input, state.key);
            result = decryptedTripleDES.toString(CryptoJS.enc.Utf8);
            break;
          default:
            result = '';
        }

        if (!result) {
          throw new Error('解密失败：密钥错误或数据损坏');
        }
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
        error: error instanceof Error ? error.message : '处理失败'
      }));
    }
  }, [state.input, state.key, state.mode, state.algorithm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleProcess();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleProcess]);

  const toggleMode = () => {
    setState(prev => ({
      ...prev,
      mode: prev.mode === 'encrypt' ? 'decrypt' : 'encrypt',
      input: prev.output || prev.input,
      output: '',
      error: undefined
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

  const generateRandomKey = () => {
    const key = CryptoJS.lib.WordArray.random(32).toString();
    setState(prev => ({ ...prev, key }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">对称加密工具</CardTitle>
                <CardDescription className="mt-1">
                  AES/DES/3DES 加密解密，保护敏感数据安全
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={state.mode === 'encrypt' ? 'default' : 'secondary'} className="text-sm">
                {state.mode === 'encrypt' ? '加密' : '解密'}
              </Badge>
              <Badge variant="outline" className="text-sm">{state.algorithm}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 配置区域 */}
      <Card>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">加密算法</label>
                <select
                  value={state.algorithm}
                  onChange={(e) => setState(prev => ({ ...prev, algorithm: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="AES">AES (高级加密标准)</option>
                  <option value="DES">DES (数据加密标准)</option>
                  <option value="TripleDES">3DES (三重DES)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">密钥</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="输入加密密钥..."
                    value={state.key}
                    onChange={(e) => setState(prev => ({ ...prev, key: e.target.value }))}
                    className="font-mono"
                  />
                  <Button onClick={generateRandomKey} variant="outline" size="sm">
                    <Icons.Dices className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={toggleMode} variant="outline">
                <Icons.RefreshCw className="w-4 h-4 mr-2" />
                切换到{state.mode === 'encrypt' ? '解密' : '加密'}
              </Button>
            </div>
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
                {state.mode === 'encrypt' ? '原始文本' : '加密文本'}
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={state.mode === 'encrypt' ? '输入要加密的文本...' : '输入要解密的密文...'}
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'encrypt' ? '加密结果' : '解密结果'}
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="结果将显示在这里..."
              value={state.output}
              readOnly
              className={`min-h-[200px] font-mono text-sm ${state.error ? 'border-destructive' : ''}`}
            />
            {state.error && (
              <div className="mt-2 text-xs text-destructive flex items-center">
                <Icons.AlertCircle className="w-3 h-3 mr-1" />
                {state.error}
              </div>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">AES</h4>
              <ul className="space-y-1">
                <li>• 最安全的对称加密</li>
                <li>• 推荐用于敏感数据</li>
                <li>• 密钥长度可变</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">DES</h4>
              <ul className="space-y-1">
                <li>• 传统加密标准</li>
                <li>• 安全性较低</li>
                <li>• 兼容性好</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">3DES</h4>
              <ul className="space-y-1">
                <li>• DES 的增强版</li>
                <li>• 中等安全性</li>
                <li>• 广泛使用</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              ⚠️ 警告：请妥善保管密钥，丢失密钥将无法解密数据。所有加密操作在浏览器本地完成。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
