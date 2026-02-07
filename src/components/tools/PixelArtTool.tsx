import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface PixelArtToolState {
  originalImage: string | null;
  pixelatedImage: string | null;
  pixelSize: number;
  colorDepth: number;
  error?: string;
}

export function PixelArtTool() {
  const [state, setState] = useState<PixelArtToolState>({
    originalImage: null,
    pixelatedImage: null,
    pixelSize: 8,
    colorDepth: 32
  });

  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 像素化处理函数
  const pixelateImage = useCallback((imageUrl: string, pixelSize: number, colorDepth: number) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建画布上下文'));
          return;
        }

        // 设置画布大小为原图大小
        canvas.width = img.width;
        canvas.height = img.height;

        // 计算像素化后的尺寸
        const pixelWidth = Math.ceil(img.width / pixelSize);
        const pixelHeight = Math.ceil(img.height / pixelSize);

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 像素化处理
        for (let y = 0; y < pixelHeight; y++) {
          for (let x = 0; x < pixelWidth; x++) {
            // 计算当前像素块的起始位置
            const startX = x * pixelSize;
            const startY = y * pixelSize;

            // 计算当前像素块的平均颜色
            let r = 0, g = 0, b = 0, count = 0;

            for (let py = 0; py < pixelSize && startY + py < img.height; py++) {
              for (let px = 0; px < pixelSize && startX + px < img.width; px++) {
                const idx = ((startY + py) * img.width + (startX + px)) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
              }
            }

            // 计算平均值
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            // 颜色深度处理（色彩量化）
            if (colorDepth < 256) {
              const step = Math.floor(256 / colorDepth);
              r = Math.round(r / step) * step;
              g = Math.round(g / step) * step;
              b = Math.round(b / step) * step;
            }

            // 填充像素块
            for (let py = 0; py < pixelSize && startY + py < img.height; py++) {
              for (let px = 0; px < pixelSize && startX + px < img.width; px++) {
                const idx = ((startY + py) * img.width + (startX + px)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
              }
            }
          }
        }

        // 将处理后的图像数据放回画布
        ctx.putImageData(imageData, 0, 0);

        // 转换为base64
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = imageUrl;
    });
  }, []);

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: '请选择图片文件' }));
      return;
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: '图片文件不能超过 10MB' }));
      return;
    }

    try {
      setProcessing(true);
      setState(prev => ({ ...prev, error: undefined }));

      // 读取文件
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setState(prev => ({ ...prev, originalImage: imageUrl }));

        // 自动进行像素化处理
        try {
          const pixelated = await pixelateImage(imageUrl, state.pixelSize, state.colorDepth);
          setState(prev => ({ ...prev, pixelatedImage: pixelated }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : '处理失败'
          }));
        } finally {
          setProcessing(false);
        }
      };

      reader.onerror = () => {
        setState(prev => ({ ...prev, error: '文件读取失败' }));
        setProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '处理失败'
      }));
      setProcessing(false);
    }
  };

  // 重新处理图片
  const reprocessImage = useCallback(async () => {
    if (!state.originalImage) return;

    try {
      setProcessing(true);
      setState(prev => ({ ...prev, error: undefined }));

      const pixelated = await pixelateImage(state.originalImage, state.pixelSize, state.colorDepth);
      setState(prev => ({ ...prev, pixelatedImage: pixelated }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '处理失败'
      }));
    } finally {
      setProcessing(false);
    }
  }, [state.originalImage, state.pixelSize, state.colorDepth, pixelateImage]);

  // 当像素大小或颜色深度改变时自动重新处理图片
  useEffect(() => {
    if (state.originalImage) {
      reprocessImage();
    }
  }, [state.pixelSize, state.colorDepth]);

  // 选择图片
  const selectImage = () => {
    fileInputRef.current?.click();
  };

  // 下载图片
  const downloadImage = () => {
    if (!state.pixelatedImage) return;

    const link = document.createElement('a');
    link.href = state.pixelatedImage;
    link.download = `pixel-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 清空所有
  const clearAll = () => {
    setState({
      originalImage: null,
      pixelatedImage: null,
      pixelSize: 8,
      colorDepth: 32,
      error: undefined
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 加载示例图片
  const loadExample = () => {
    // 创建一个简单的渐变示例图片
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // 绘制彩色方块
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
      const blockSize = 100;
      
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          ctx.fillStyle = colors[(y * 4 + x) % colors.length];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
      
      // 添加一些渐变
      const gradient = ctx.createRadialGradient(200, 200, 50, 200, 200, 200);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      const imageUrl = canvas.toDataURL('image/png');
      setState(prev => ({ ...prev, originalImage: imageUrl }));
      
      // 自动处理
      pixelateImage(imageUrl, state.pixelSize, state.colorDepth).then(pixelated => {
        setState(prev => ({ ...prev, pixelatedImage: pixelated }));
      });
    }
  };

  // 预设像素大小
  const pixelSizes = [4, 8, 16, 24, 32];
  const colorDepths = [8, 16, 32, 64, 128, 256];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Image className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">图片转像素画工具</CardTitle>
                <CardDescription className="mt-1">
                  将普通图片转换为像素艺术风格，支持调整像素大小和颜色深度
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm">
                像素: {state.pixelSize}px
              </Badge>
              <Badge variant="outline" className="text-sm">
                颜色: {state.colorDepth}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={selectImage} variant="default">
                <Icons.Upload className="w-4 h-4 mr-2" />
                选择图片
              </Button>
              <Button onClick={loadExample} variant="outline">
                <Icons.FileText className="w-4 h-4 mr-2" />
                加载示例
              </Button>
              <Button 
                onClick={reprocessImage} 
                variant="outline"
                disabled={!state.originalImage || processing}
              >
                <Icons.RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                重新处理
              </Button>
              <Button 
                onClick={downloadImage} 
                variant="outline"
                disabled={!state.pixelatedImage}
              >
                <Icons.Download className="w-4 h-4 mr-2" />
                下载结果
              </Button>
              <Button onClick={clearAll} variant="outline">
                <Icons.Trash2 className="w-4 h-4 mr-2" />
                清空
              </Button>
            </div>

            {/* 像素大小选择 */}
            <div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">像素大小:</span>
                {pixelSizes.map(size => (
                  <Button
                    key={size}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, pixelSize: size }))}
                    variant={state.pixelSize === size ? 'default' : 'outline'}
                  >
                    {size}px
                  </Button>
                ))}
              </div>
            </div>

            {/* 颜色深度选择 */}
            <div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">颜色深度:</span>
                {colorDepths.map(depth => (
                  <Button
                    key={depth}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, colorDepth: depth }))}
                    variant={state.colorDepth === depth ? 'default' : 'outline'}
                  >
                    {depth}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图片预览区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 原始图片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">原始图片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center">
              {state.originalImage ? (
                <img 
                  src={state.originalImage} 
                  alt="原始图片" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <Icons.ImageOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>请选择或上传图片</p>
                  <p className="text-sm mt-2">支持 JPG, PNG, GIF 等格式</p>
                  <p className="text-sm">最大 10MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 像素化结果 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">像素画结果</CardTitle>
              {processing && (
                <Badge variant="secondary" className="text-xs">
                  <Icons.Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  处理中...
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center">
              {state.pixelatedImage ? (
                <img 
                  src={state.pixelatedImage} 
                  alt="像素画结果" 
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  <Icons.Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>处理结果将显示在这里</p>
                  {state.originalImage && (
                    <Button 
                      onClick={reprocessImage} 
                      className="mt-4"
                      disabled={processing}
                    >
                      开始处理
                    </Button>
                  )}
                </div>
              )}
            </div>
            {state.error && (
              <div className="mt-4 text-sm text-destructive flex items-center justify-center">
                <Icons.AlertCircle className="w-4 h-4 mr-1" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">参数说明</h4>
              <ul className="space-y-1">
                <li>• <strong>像素大小:</strong> 每个像素块的大小，越大越粗糙</li>
                <li>• <strong>颜色深度:</strong> 使用的颜色数量，越小越复古</li>
                <li>• <strong>支持格式:</strong> JPG, PNG, GIF, WebP 等</li>
                <li>• <strong>文件限制:</strong> 最大支持 10MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">使用技巧</h4>
              <ul className="space-y-1">
                <li>• 小像素值适合制作精细的像素艺术</li>
                <li>• 大像素值适合创造复古游戏风格</li>
                <li>• 降低颜色深度可获得8位游戏的效果</li>
                <li>• 可以多次调整参数直到满意</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：所有图片处理都在浏览器本地完成，不会上传到服务器，完全保护您的隐私。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 隐藏的画布（用于图像处理） */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
