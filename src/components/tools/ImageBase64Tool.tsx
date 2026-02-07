import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as Icons from 'lucide-react';

export function ImageBase64Tool() {
  const [base64, setBase64] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mode, setMode] = useState<'toBase64' | 'fromBase64'>('toBase64');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Input = (value: string) => {
    setBase64(value);
    if (value.trim()) {
      setImageUrl(value);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image.png';
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Image className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">图片 Base64 互转</CardTitle>
              <CardDescription className="mt-1">
                图片与 Base64 字符串互相转换
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">上传图片</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Icons.Upload className="w-4 h-4 mr-2" />
              选择图片文件
            </Button>
            
            {imageUrl && (
              <div className="space-y-3">
                <div className="border rounded-lg p-3 bg-muted/30">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full max-h-[300px] mx-auto rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadImage} variant="outline" className="flex-1">
                    <Icons.Download className="w-4 h-4 mr-2" />
                    下载图片
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    {copySuccess ? <Icons.Check className="w-4 h-4 mr-2" /> : <Icons.Copy className="w-4 h-4 mr-2" />}
                    复制 Base64
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Base64 字符串</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="粘贴 Base64 字符串预览图片，或上传图片生成 Base64..."
              value={base64}
              onChange={(e) => handleBase64Input(e.target.value)}
              className="min-h-[400px] font-mono text-xs"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {base64.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
