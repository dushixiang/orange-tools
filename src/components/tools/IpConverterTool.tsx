import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface IpConversionResult {
  decimal: string;
  binary: string;
  hexadecimal: string;
  error?: string;
}

export function IpConverterTool() {
  const [input, setInput] = useState('192.168.1.1');
  const [result, setResult] = useState<IpConversionResult>({
    decimal: '192.168.1.1',
    binary: '11000000.10101000.00000001.00000001',
    hexadecimal: 'C0.A8.01.01'
  });

  // 验证IP地址格式
  const isValidIpAddress = (ip: string): boolean => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  // 验证二进制IP格式
  const isValidBinaryIp = (binary: string): boolean => {
    const parts = binary.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      return /^[01]{8}$/.test(part);
    });
  };

  // 验证十六进制IP格式
  const isValidHexIp = (hex: string): boolean => {
    const parts = hex.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      return /^[0-9A-Fa-f]{1,2}$/.test(part);
    });
  };

  // 十进制转其他进制
  const convertFromDecimal = (ip: string): IpConversionResult => {
    if (!isValidIpAddress(ip)) {
      return {
        decimal: ip,
        binary: '',
        hexadecimal: '',
        error: '无效的IP地址格式'
      };
    }

    const parts = ip.split('.').map(part => parseInt(part, 10));
    
    const binary = parts.map(num => num.toString(2).padStart(8, '0')).join('.');
    const hexadecimal = parts.map(num => num.toString(16).toUpperCase().padStart(2, '0')).join('.');

    return {
      decimal: ip,
      binary,
      hexadecimal
    };
  };

  // 二进制转其他进制
  const convertFromBinary = (binary: string): IpConversionResult => {
    if (!isValidBinaryIp(binary)) {
      return {
        decimal: '',
        binary,
        hexadecimal: '',
        error: '无效的二进制IP格式（应为8位二进制数字，用点分隔）'
      };
    }

    const parts = binary.split('.').map(part => parseInt(part, 2));
    
    const decimal = parts.join('.');
    const hexadecimal = parts.map(num => num.toString(16).toUpperCase().padStart(2, '0')).join('.');

    return {
      decimal,
      binary,
      hexadecimal
    };
  };

  // 十六进制转其他进制
  const convertFromHex = (hex: string): IpConversionResult => {
    if (!isValidHexIp(hex)) {
      return {
        decimal: '',
        binary: '',
        hexadecimal: hex,
        error: '无效的十六进制IP格式（应为1-2位十六进制数字，用点分隔）'
      };
    }

    const parts = hex.split('.').map(part => parseInt(part, 16));
    
    const decimal = parts.join('.');
    const binary = parts.map(num => num.toString(2).padStart(8, '0')).join('.');

    return {
      decimal,
      binary: binary,
      hexadecimal: hex.toUpperCase()
    };
  };

  // 自动检测输入格式并转换
  const handleConvert = useCallback(() => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      setResult({
        decimal: '',
        binary: '',
        hexadecimal: '',
        error: '请输入IP地址'
      });
      return;
    }

    // 检测输入格式
    if (isValidIpAddress(trimmedInput)) {
      // 十进制IP
      setResult(convertFromDecimal(trimmedInput));
    } else if (isValidBinaryIp(trimmedInput)) {
      // 二进制IP
      setResult(convertFromBinary(trimmedInput));
    } else if (isValidHexIp(trimmedInput)) {
      // 十六进制IP
      setResult(convertFromHex(trimmedInput));
    } else {
      setResult({
        decimal: '',
        binary: '',
        hexadecimal: '',
        error: '无法识别的IP地址格式'
      });
    }
  }, [input]);

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 使用示例
  const examples = [
    { label: '十进制', value: '192.168.1.1' },
    { label: '二进制', value: '11000000.10101000.00000001.00000001' },
    { label: '十六进制', value: 'C0.A8.01.01' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Network className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">IP地址进制转换</CardTitle>
              <CardDescription className="mt-1">
                支持十进制、二进制、十六进制IP地址格式之间的相互转换
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 操作区域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">输入IP地址</label>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入IP地址（支持十进制、二进制、十六进制格式）"
                  className="flex-1"
                />
                <Button onClick={handleConvert}>
                  <Icons.ArrowRightLeft className="w-4 h-4 mr-2" />
                  转换
                </Button>
              </div>
            </div>

            {/* 示例 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">示例格式</label>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(example.value)}
                    className="text-xs"
                  >
                    {example.label}: {example.value}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 转换结果 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icons.Hash className="w-4 h-4" />
              十进制
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-mono text-sm break-all">
                  {result.decimal || '等待转换...'}
                </div>
              </div>
              {result.decimal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.decimal)}
                  className="w-full"
                >
                  <Icons.Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icons.Binary className="w-4 h-4" />
              二进制
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-mono text-sm break-all">
                  {result.binary || '等待转换...'}
                </div>
              </div>
              {result.binary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.binary)}
                  className="w-full"
                >
                  <Icons.Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icons.Hash className="w-4 h-4" />
              十六进制
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-mono text-sm break-all">
                  {result.hexadecimal || '等待转换...'}
                </div>
              </div>
              {result.hexadecimal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(result.hexadecimal)}
                  className="w-full"
                >
                  <Icons.Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 错误信息 */}
      {result.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Icons.AlertCircle className="w-4 h-4" />
              <span className="text-sm">{result.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

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
              <h4 className="font-medium text-foreground mb-2">十进制格式</h4>
              <ul className="space-y-1">
                <li>• 标准IP地址格式</li>
                <li>• 例：192.168.1.1</li>
                <li>• 每段范围：0-255</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">二进制格式</h4>
              <ul className="space-y-1">
                <li>• 8位二进制数字</li>
                <li>• 例：11000000.10101000.00000001.00000001</li>
                <li>• 用点号分隔四段</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">十六进制格式</h4>
              <ul className="space-y-1">
                <li>• 1-2位十六进制数字</li>
                <li>• 例：C0.A8.01.01</li>
                <li>• 支持大小写字母</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：工具会自动识别输入格式并进行相应转换，支持复制转换结果到剪贴板。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}