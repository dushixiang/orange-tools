import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import bcrypt from 'bcryptjs';

export function BcryptTool() {
  const [password, setPassword] = useState('');
  const [hash, setHash] = useState('');
  const [rounds, setRounds] = useState(10);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateHash = async () => {
    if (!password.trim()) return;
    
    try {
      const hashed = await bcrypt.hash(password, rounds);
      setHash(hashed);
    } catch (error) {
      console.error('生成哈希失败:', error);
    }
  };

  const verifyPasswordHash = async () => {
    if (!verifyPassword.trim() || !verifyHash.trim()) return;

    try {
      const result = await bcrypt.compare(verifyPassword, verifyHash);
      setVerifyResult(result);
    } catch (error) {
      setVerifyResult(false);
      console.error('验证失败:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Bcrypt 哈希工具</CardTitle>
              <CardDescription className="mt-1">
                生成和验证 Bcrypt 密码哈希，安全存储用户密码
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 生成哈希 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.Lock className="w-5 h-5" />
              生成哈希
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">密码</label>
              <Input
                type="text"
                placeholder="输入要加密的密码..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Salt 轮数 (成本因子)</label>
              <Input
                type="number"
                min="4"
                max="15"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 10)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                推荐值: 10-12，数值越大越安全但速度越慢
              </p>
            </div>
            <Button onClick={generateHash} disabled={!password.trim()} className="w-full">
              <Icons.Hash className="w-4 h-4 mr-2" />
              生成哈希
            </Button>
            {hash && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">哈希结果</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(hash)}
                  >
                    {copySuccess ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={hash}
                  readOnly
                  className="font-mono text-xs"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 验证哈希 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.CheckCircle className="w-5 h-5" />
              验证哈希
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">密码</label>
              <Input
                type="text"
                placeholder="输入要验证的密码..."
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bcrypt 哈希</label>
              <Textarea
                placeholder="粘贴 Bcrypt 哈希值..."
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                className="font-mono text-xs"
                rows={3}
              />
            </div>
            <Button
              onClick={verifyPasswordHash}
              disabled={!verifyPassword.trim() || !verifyHash.trim()}
              className="w-full"
            >
              <Icons.Shield className="w-4 h-4 mr-2" />
              验证密码
            </Button>
            {verifyResult !== null && (
              <div className={`p-4 rounded-lg ${verifyResult ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                <div className="flex items-center gap-2">
                  {verifyResult ? (
                    <>
                      <Icons.CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-600">密码匹配 ✓</span>
                    </>
                  ) : (
                    <>
                      <Icons.XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-600">密码不匹配 ✗</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            关于 Bcrypt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">安全特性</h4>
              <ul className="space-y-1">
                <li>• 自动加盐防彩虹表攻击</li>
                <li>• 计算成本可配置</li>
                <li>• 业界标准密码哈希</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">成本因子</h4>
              <ul className="space-y-1">
                <li>• 10: ~65ms (推荐)</li>
                <li>• 12: ~250ms (高安全)</li>
                <li>• 14: ~1000ms (极高)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">使用场景</h4>
              <ul className="space-y-1">
                <li>• 用户密码存储</li>
                <li>• API 密钥加密</li>
                <li>• 敏感数据保护</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
