import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Icons from 'lucide-react';
import JsBarcode from 'jsbarcode';

export function BarcodeTool() {
  const [text, setText] = useState('123456789012');
  const [format, setFormat] = useState('CODE128');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (text.trim() && canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, text, {
          format,
          width: 2,
          height: 100,
          displayValue: true,
        });
      } catch (error) {
        console.error('生成条形码失败:', error);
      }
    }
  }, [text, format]);

  const downloadBarcode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'barcode.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.ScanBarcode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">条形码生成器</CardTitle>
              <CardDescription className="mt-1">
                生成 Code128、EAN、UPC 等格式的条形码
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">条形码内容</label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入条形码内容..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="CODE128">CODE128</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="CODE39">CODE39</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">条形码预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <canvas ref={canvasRef} className="border rounded-lg p-4" />
            <Button onClick={downloadBarcode}>
              <Icons.Download className="w-4 h-4 mr-2" />
              下载条形码
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
