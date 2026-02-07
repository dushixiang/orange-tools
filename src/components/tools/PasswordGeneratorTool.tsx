import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface PasswordGeneratorState {
  password: string;
  batchPasswords: string[];
  length: number;
  batchCount: number;
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
    excludeAmbiguous: boolean;
  };
}

export function PasswordGeneratorTool() {
  const [state, setState] = useState<PasswordGeneratorState>({
    password: '',
    batchPasswords: [],
    length: 16,
    batchCount: 10,
    options: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false
    }
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // 字符集
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\\\'"`~,;:.<>'
  };

  // 生成密码
  const generatePassword = (length: number, options: typeof state.options): string => {
    let chars = '';
    
    if (options.uppercase) chars += charSets.uppercase;
    if (options.lowercase) chars += charSets.lowercase;
    if (options.numbers) chars += charSets.numbers;
    if (options.symbols) chars += charSets.symbols;

    // 排除相似字符
    if (options.excludeSimilar) {
      chars = chars.split('').filter(c => !charSets.similar.includes(c)).join('');
    }

    // 排除易混淆字符
    if (options.excludeAmbiguous) {
      chars = chars.split('').filter(c => !charSets.ambiguous.includes(c)).join('');
    }

    if (chars.length === 0) {
      return '请至少选择一种字符类型';
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }

    return password;
  };

  // 生成单个密码
  const handleGenerateSingle = () => {
    const pwd = generatePassword(state.length, state.options);
    setState(prev => ({ ...prev, password: pwd }));
  };

  // 生成批量密码
  const handleGenerateBatch = () => {
    const count = Math.min(Math.max(1, state.batchCount), 100);
    const passwords: string[] = [];

    for (let i = 0; i < count; i++) {
      passwords.push(generatePassword(state.length, state.options));
    }

    setState(prev => ({ ...prev, batchPasswords: passwords }));
  };

  // 评估密码强度
  const evaluateStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '无', color: 'text-muted-foreground' };

    let score = 0;

    // 长度评分
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // 字符类型评分
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: '弱', color: 'text-destructive' };
    if (score <= 4) return { score, label: '中', color: 'text-yellow-500' };
    if (score <= 6) return { score, label: '强', color: 'text-green-500' };
    return { score, label: '非常强', color: 'text-green-600' };
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

  // 更新选项
  const toggleOption = (key: keyof typeof state.options) => {
    setState(prev => ({
      ...prev,
      options: { ...prev.options, [key]: !prev.options[key] }
    }));
  };

  const strength = evaluateStrength(state.password);
  const batchText = state.batchPasswords.join('\n');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.KeyRound className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">随机密码生成器</CardTitle>
                <CardDescription className="mt-1">
                  生成安全的随机密码，支持自定义长度和字符类型
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 密码长度 */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap">密码长度:</label>
              <input
                type="range"
                min="4"
                max="64"
                value={state.length}
                onChange={(e) => setState(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <Input
                type="number"
                min="4"
                max="64"
                value={state.length}
                onChange={(e) => setState(prev => ({ ...prev, length: parseInt(e.target.value) || 16 }))}
                className="w-20"
              />
            </div>

            {/* 字符选项 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                size="sm"
                variant={state.options.uppercase ? 'default' : 'outline'}
                onClick={() => toggleOption('uppercase')}
              >
                <Icons.CheckSquare className="w-4 h-4 mr-2" />
                大写字母 (A-Z)
              </Button>
              <Button
                size="sm"
                variant={state.options.lowercase ? 'default' : 'outline'}
                onClick={() => toggleOption('lowercase')}
              >
                <Icons.CheckSquare className="w-4 h-4 mr-2" />
                小写字母 (a-z)
              </Button>
              <Button
                size="sm"
                variant={state.options.numbers ? 'default' : 'outline'}
                onClick={() => toggleOption('numbers')}
              >
                <Icons.CheckSquare className="w-4 h-4 mr-2" />
                数字 (0-9)
              </Button>
              <Button
                size="sm"
                variant={state.options.symbols ? 'default' : 'outline'}
                onClick={() => toggleOption('symbols')}
              >
                <Icons.CheckSquare className="w-4 h-4 mr-2" />
                特殊符号 (!@#$...)
              </Button>
              <Button
                size="sm"
                variant={state.options.excludeSimilar ? 'default' : 'outline'}
                onClick={() => toggleOption('excludeSimilar')}
              >
                排除相似字符
              </Button>
              <Button
                size="sm"
                variant={state.options.excludeAmbiguous ? 'default' : 'outline'}
                onClick={() => toggleOption('excludeAmbiguous')}
              >
                排除易混淆字符
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 单个密码生成 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">生成的密码</CardTitle>
            {state.password && (
              <Badge className={strength.color}>
                强度: {strength.label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={state.password}
                readOnly
                placeholder="点击下方按钮生成密码"
                className="font-mono text-lg"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(state.password, 'single')}
                disabled={!state.password}
              >
                {copySuccess === 'single' ? (
                  <Icons.Check className="w-4 h-4" />
                ) : (
                  <Icons.Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleGenerateSingle} className="w-full">
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              生成新密码
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 批量生成 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">批量生成密码</CardTitle>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">数量:</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={state.batchCount}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  batchCount: parseInt(e.target.value) || 10 
                }))}
                className="w-20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={handleGenerateBatch} className="flex-1">
                <Icons.Layers className="w-4 h-4 mr-2" />
                生成 {state.batchCount} 个密码
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(batchText, 'batch')}
                disabled={state.batchPasswords.length === 0}
              >
                {copySuccess === 'batch' ? (
                  <>
                    <Icons.Check className="w-4 h-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Icons.Copy className="w-4 h-4 mr-2" />
                    复制全部
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={batchText}
              readOnly
              placeholder="批量生成的密码将显示在这里，每行一个"
              className="min-h-[300px] font-mono text-sm"
            />
            {state.batchPasswords.length > 0 && (
              <div className="text-xs text-muted-foreground">
                已生成 {state.batchPasswords.length} 个密码
              </div>
            )}
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
              <h4 className="font-medium text-foreground mb-2">密码强度建议</h4>
              <ul className="space-y-1">
                <li>• 长度至少 12 位以上</li>
                <li>• 混合使用大小写字母</li>
                <li>• 包含数字和特殊符号</li>
                <li>• 避免使用个人信息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">安全提示</h4>
              <ul className="space-y-1">
                <li>• 不同账号使用不同密码</li>
                <li>• 定期更换重要账号密码</li>
                <li>• 使用密码管理器存储</li>
                <li>• 启用双因素认证</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：本工具使用浏览器 Crypto API 生成真随机数，所有操作都在本地完成，不会上传任何数据。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
