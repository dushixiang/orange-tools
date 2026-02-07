import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface BaseConverterState {
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
  error?: string;
}

export function BaseConverterTool() {
  const [state, setState] = useState<BaseConverterState>({
    binary: '',
    octal: '',
    decimal: '',
    hexadecimal: ''
  });

  const [copySuccess, setCopySuccess] = useState<string>('');
  const [activeInput, setActiveInput] = useState<'binary' | 'octal' | 'decimal' | 'hexadecimal'>('decimal');

  // 验证输入
  const validateInput = useCallback((value: string, base: number): boolean => {
    if (!value) return true;
    
    const validChars: { [key: number]: string } = {
      2: '01',
      8: '01234567',
      10: '0123456789',
      16: '0123456789ABCDEFabcdef'
    };

    return value.split('').every(char => validChars[base].includes(char));
  }, []);

  // 转换所有进制
  const convertAll = useCallback((value: string, fromBase: number) => {
    if (!value.trim()) {
      setState({
        binary: '',
        octal: '',
        decimal: '',
        hexadecimal: '',
        error: undefined
      });
      return;
    }

    try {
      // 先转换为十进制
      const decimalValue = parseInt(value, fromBase);

      if (isNaN(decimalValue) || decimalValue < 0) {
        throw new Error('无效的数值');
      }

      // 检查数值范围
      if (decimalValue > Number.MAX_SAFE_INTEGER) {
        throw new Error('数值超出安全范围');
      }

      setState({
        binary: decimalValue.toString(2),
        octal: decimalValue.toString(8),
        decimal: decimalValue.toString(10),
        hexadecimal: decimalValue.toString(16).toUpperCase(),
        error: undefined
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '转换失败'
      }));
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (value: string, type: 'binary' | 'octal' | 'decimal' | 'hexadecimal') => {
    setActiveInput(type);

    const bases = {
      binary: 2,
      octal: 8,
      decimal: 10,
      hexadecimal: 16
    };

    const base = bases[type];

    // 验证输入
    if (!validateInput(value, base)) {
      setState(prev => ({
        ...prev,
        [type]: value,
        error: `输入包含${type === 'binary' ? '二' : type === 'octal' ? '八' : type === 'decimal' ? '十' : '十六'}进制无效字符`
      }));
      return;
    }

    setState(prev => ({ ...prev, [type]: value, error: undefined }));

    if (value) {
      convertAll(value, base);
    } else {
      setState({
        binary: '',
        octal: '',
        decimal: '',
        hexadecimal: '',
        error: undefined
      });
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 清空所有
  const clearAll = () => {
    setState({
      binary: '',
      octal: '',
      decimal: '',
      hexadecimal: '',
      error: undefined
    });
    setActiveInput('decimal');
  };

  // 加载示例
  const loadExample = () => {
    const examples = [
      { decimal: '255' },
      { decimal: '1024' },
      { decimal: '42' },
      { decimal: '65535' }
    ];
    
    const example = examples[Math.floor(Math.random() * examples.length)];
    handleInputChange(example.decimal, 'decimal');
  };

  const bases = [
    { key: 'binary', name: '二进制', prefix: '0b', value: state.binary, icon: Icons.Binary },
    { key: 'octal', name: '八进制', prefix: '0o', value: state.octal, icon: Icons.Hash },
    { key: 'decimal', name: '十进制', prefix: '', value: state.decimal, icon: Icons.Hash },
    { key: 'hexadecimal', name: '十六进制', prefix: '0x', value: state.hexadecimal, icon: Icons.Hash }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Binary className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">进制转换器</CardTitle>
                <CardDescription className="mt-1">
                  二进制、八进制、十进制、十六进制之间的相互转换
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
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

      {/* 转换区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bases.map(({ key, name, prefix, value, icon: Icon }) => (
          <Card key={key} className={activeInput === key ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{name}</CardTitle>
                  {prefix && (
                    <Badge variant="outline" className="text-xs">{prefix}</Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(prefix + value, key)}
                  disabled={!value}
                >
                  {copySuccess === key ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                value={value}
                onChange={(e) => handleInputChange(e.target.value, key as any)}
                placeholder={`输入${name}数值...`}
                className="font-mono text-lg"
              />
              {value && (
                <div className="mt-2 text-xs text-muted-foreground">
                  位数: {value.length}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 错误提示 */}
      {state.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center text-destructive">
              <Icons.AlertCircle className="w-4 h-4 mr-2" />
              {state.error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 快速参考 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.BookOpen className="w-5 h-5 mr-2" />
            快速参考表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">十进制</th>
                  <th className="text-left py-2 px-4">二进制</th>
                  <th className="text-left py-2 px-4">八进制</th>
                  <th className="text-left py-2 px-4">十六进制</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {[0, 1, 2, 8, 10, 15, 16, 255, 256].map(num => (
                  <tr key={num} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{num}</td>
                    <td className="py-2 px-4">{num.toString(2)}</td>
                    <td className="py-2 px-4">{num.toString(8)}</td>
                    <td className="py-2 px-4">{num.toString(16).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
              <h4 className="font-medium text-foreground mb-2">进制说明</h4>
              <ul className="space-y-1">
                <li>• <strong>二进制 (Binary):</strong> 0-1，计算机内部表示</li>
                <li>• <strong>八进制 (Octal):</strong> 0-7，Unix权限表示</li>
                <li>• <strong>十进制 (Decimal):</strong> 0-9，日常使用</li>
                <li>• <strong>十六进制 (Hex):</strong> 0-9, A-F，颜色代码等</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• 编程开发中的进制转换</li>
                <li>• IP地址计算</li>
                <li>• 颜色值转换</li>
                <li>• 文件权限设置</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：在任意输入框中输入数值，其他进制会自动转换。点击输入框边框高亮显示当前活跃的输入。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
