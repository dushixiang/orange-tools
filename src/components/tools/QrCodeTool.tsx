import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as Icons from 'lucide-react';
import QRCode from 'qrcode';

interface QrCodeState {
  text: string;
  size: number;
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  darkColor: string;
  lightColor: string;
  qrCodeDataUrl: string;
}

export function QrCodeTool() {
  const [state, setState] = useState<QrCodeState>({
    text: 'Hello, World!',
    size: 256,
    errorLevel: 'M',
    margin: 4,
    darkColor: '#000000',
    lightColor: '#ffffff',
    qrCodeDataUrl: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 使用 qrcode 库生成真正的二维码
  const generateQrCode = async (text: string, size: number) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 使用 qrcode 库生成二维码到 canvas
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: state.margin,
        color: {
          dark: state.darkColor,
          light: state.lightColor
        },
        errorCorrectionLevel: state.errorLevel
      });

      // 转换为数据URL
      const dataUrl = canvas.toDataURL('image/png');
      setState(prev => ({ ...prev, qrCodeDataUrl: dataUrl }));
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  useEffect(() => {
    if (state.text.trim()) {
      generateQrCode(state.text, state.size);
    }
  }, [state.text, state.size, state.darkColor, state.lightColor, state.margin, state.errorLevel]);

  const downloadQrCode = () => {
    if (state.qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = state.qrCodeDataUrl;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    try {
      if (state.qrCodeDataUrl) {
        const response = await fetch(state.qrCodeDataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      }
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.QrCode className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">二维码生成器</CardTitle>
                <CardDescription className="mt-1">
                  将文本、URL或其他数据转换为二维码图片，支持自定义颜色和尺寸
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入配置区域 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icons.Type className="w-4 h-4" />
              输入内容
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">要编码的文本</label>
              <Textarea
                placeholder="输入要生成二维码的文本、URL或数据..."
                value={state.text}
                onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
                className="min-h-[80px] font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                字符数: {state.text.length}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">尺寸</label>
                <Input
                  type="number"
                  min="128"
                  max="512"
                  step="32"
                  value={state.size}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    size: Math.max(128, Math.min(512, parseInt(e.target.value) || 256))
                  }))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">容错级别</label>
                <select
                  value={state.errorLevel}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    errorLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'
                  }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="L">L (~7%)</option>
                  <option value="M">M (~15%)</option>
                  <option value="Q">Q (~25%)</option>
                  <option value="H">H (~30%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">前景色</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={state.darkColor}
                    onChange={(e) => setState(prev => ({ ...prev, darkColor: e.target.value }))}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={state.darkColor}
                    onChange={(e) => setState(prev => ({ ...prev, darkColor: e.target.value }))}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">背景色</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={state.lightColor}
                    onChange={(e) => setState(prev => ({ ...prev, lightColor: e.target.value }))}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={state.lightColor}
                    onChange={(e) => setState(prev => ({ ...prev, lightColor: e.target.value }))}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 快速模板 */}
            <div>
              <label className="text-sm font-medium mb-2 block">快速模板</label>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, text: 'https://github.com' }))}
                  className="text-xs"
                >
                  <Icons.Github className="w-3 h-3 mr-1" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, text: 'mailto:example@email.com' }))}
                  className="text-xs"
                >
                  <Icons.Mail className="w-3 h-3 mr-1" />
                  邮箱
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, text: 'tel:+1234567890' }))}
                  className="text-xs"
                >
                  <Icons.Phone className="w-3 h-3 mr-1" />
                  电话
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    text: 'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;' 
                  }))}
                  className="text-xs"
                >
                  <Icons.Wifi className="w-3 h-3 mr-1" />
                  WiFi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 二维码预览区域 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icons.Eye className="w-4 h-4" />
              二维码预览
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg shadow-sm max-w-full"
                  style={{ maxWidth: '280px', height: 'auto' }}
                />
                {!state.text.trim() && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Icons.QrCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">输入文本生成二维码</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {state.qrCodeDataUrl && (
              <div className="flex gap-2">
                <Button onClick={downloadQrCode} className="flex-1" size="sm">
                  <Icons.Download className="w-3 h-3 mr-1" />
                  下载
                </Button>
                <Button onClick={copyToClipboard} variant="outline" className="flex-1" size="sm">
                  <Icons.Copy className="w-3 h-3 mr-1" />
                  复制
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>尺寸: {state.size} × {state.size} 像素</p>
              <p>容错: {state.errorLevel} | 长度: {state.text.length} 字符</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}