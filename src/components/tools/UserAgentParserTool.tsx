import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { UAParser } from 'ua-parser-js';

export function UserAgentParserTool() {
  const [ua, setUa] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // 自动加载当前浏览器的 UA
    setUa(navigator.userAgent);
  }, []);

  useEffect(() => {
    if (ua.trim()) {
      const parser = new UAParser(ua);
      setParsed(parser.getResult());
    } else {
      setParsed(null);
    }
  }, [ua]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const loadCurrentUA = () => {
    setUa(navigator.userAgent);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Monitor className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">User-Agent 解析器</CardTitle>
              <CardDescription className="mt-1">
                解析浏览器 User-Agent 字符串，识别设备和浏览器信息
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">User-Agent 字符串</CardTitle>
            <Button onClick={loadCurrentUA} variant="outline" size="sm">
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              当前浏览器
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="粘贴 User-Agent 字符串..."
            value={ua}
            onChange={(e) => setUa(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {parsed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.Globe className="w-4 h-4" />
                  浏览器
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">名称</div>
                    <div className="font-semibold">{parsed.browser.name || '未知'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">版本</div>
                    <div className="font-mono">{parsed.browser.version || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.Smartphone className="w-4 h-4" />
                  设备
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">类型</div>
                    <div className="font-semibold">{parsed.device.type || '桌面设备'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">厂商</div>
                    <div>{parsed.device.vendor || '未知'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.Laptop className="w-4 h-4" />
                  操作系统
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">系统</div>
                    <div className="font-semibold">{parsed.os.name || '未知'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">版本</div>
                    <div className="font-mono">{parsed.os.version || 'N/A'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.Cpu className="w-4 h-4" />
                  CPU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">架构</div>
                    <div className="font-mono">{parsed.cpu.architecture || '未知'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">完整解析结果 (JSON)</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(parsed, null, 2))}
                >
                  {copySuccess ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/30 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
