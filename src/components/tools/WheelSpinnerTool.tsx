import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { LuckyWheel } from '@lucky-canvas/react';
import chroma from 'chroma-js';

export function WheelSpinnerTool() {
  const [options, setOptions] = useState('选项1\n选项2\n选项3\n选项4\n选项5\n选项6');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const luckyRef = useRef<any>(null);

  const optionList = options
    .split('\n')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);

  // 更美观的配色：基于 ColorBrewer 的 Set3，并在数量较多时使用 LCH 插值
  const generatePleasantColors = (count: number): string[] => {
    if (count <= 0) return [];
    const base: string[] = (chroma as any).brewer?.Set3 ?? [
      '#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
      '#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'
    ];
    const baseLen = base.length;
    if (count <= baseLen) {
      // 等距选取，避免相邻颜色过于相似
      return Array.from({ length: count }, (_, i) => {
        const idx = Math.round((i * baseLen) / count) % baseLen;
        return base[idx];
      });
    }
    return chroma
      .scale(base)
      .mode('lch')
      .correctLightness(true)
      .colors(count);
  };

  const getTextColor = (bg: string): string => {
    return chroma.contrast(bg, '#ffffff') >= 4.5 ? '#ffffff' : '#111827';
  };

  // 构建转盘配置 - 简约风格
  const blocks = [
    { padding: '13px', background: '#ffffff', borderRadius: '50%' }
  ];

  const segmentColors = generatePleasantColors(optionList.length);

  const prizes = optionList.map((option, index) => ({
    background: segmentColors[index],
    fonts: [{ 
      text: option, 
      top: '30%', 
      fontSize: '18px', 
      fontColor: getTextColor(segmentColors[index]), 
      fontWeight: '600',
      wordWrap: true,
      lengthLimit: '90%'
    }]
  }));

  // 仅保留中心按钮，移除画布指针，改用顶部高对比指针
  const buttons = [
    { 
      radius: '50px', 
      background: '#ffffff',
      fonts: [{ 
        text: 'START', 
        top: '-10px', 
        fontSize: '16px', 
        fontColor: '#1f2937', // 灰黑，提高可读性
        fontWeight: '700'
      }]
    }
  ];

  const spin = () => {
    if (isSpinning || optionList.length === 0) return;
    
    setIsSpinning(true);
    setResult('');
    
    // 随机选择一个奖品索引
    const randomIndex = Math.floor(Math.random() * optionList.length);
    
    // 调用转盘的 play 方法开始抽奖
    luckyRef.current?.play();
    
    // 2秒后停止在目标位置
    setTimeout(() => {
      luckyRef.current?.stop(randomIndex);
    }, 3000);
  };

  const handleEnd = (prize: any) => {
    setIsSpinning(false);
    setResult(prize.fonts[0].text);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Disc3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">大转盘/轮盘抽奖</CardTitle>
              <CardDescription className="mt-1">
                随机选择工具，适用于抽奖、决策等场景
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 转盘区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">转盘</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {optionList.length > 0 ? (
              <div className="w-96 h-96 mb-6 relative">
                {/* 顶部指针（高对比黑色） */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
                  <div
                    className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[35px] drop-shadow-lg"
                    style={{ borderTopColor: '#111827' }}
                  />
                </div>
                
                {/* 转盘 */}
                <div className="rounded-full shadow-2xl overflow-hidden">
                  <LuckyWheel
                    ref={luckyRef}
                    width="384px"
                    height="384px"
                    blocks={blocks}
                    prizes={prizes}
                    buttons={buttons}
                    onEnd={handleEnd}
                    defaultStyle={{
                      fontColor: '#ffffff',
                      fontSize: '18px'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-96 h-96 mb-6 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-full bg-muted/5">
                <p className="text-muted-foreground">请添加选项</p>
              </div>
            )}

            <Button
              onClick={spin}
              disabled={isSpinning || optionList.length === 0}
              size="lg"
              className="w-full max-w-xs h-16 text-xl"
            >
              {isSpinning ? (
                <>
                  <Icons.Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  抽取中...
                </>
              ) : (
                <>
                  <Icons.Play className="w-5 h-5 mr-2" />
                  开始抽奖
                </>
              )}
            </Button>

            {result && (
              <div className="mt-6 w-full">
                <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-2 border-yellow-500 text-center">
                  <p className="text-sm text-muted-foreground mb-2">🎉 抽取结果</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{result}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 选项设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">选项设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="每行一个选项..."
              className="min-h-[300px] font-mono"
              disabled={isSpinning}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                共 {optionList.length} 个选项
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOptions('选项1\n选项2\n选项3\n选项4\n选项5\n选项6')}
                disabled={isSpinning}
              >
                <Icons.RotateCcw className="w-3 h-3 mr-1" />
                重置
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">当前选项预览</label>
              <div className="flex flex-wrap gap-2">
                {optionList.map((opt, index) => (
                  <Badge
                    key={index}
                    style={{
                      backgroundColor: segmentColors[index],
                      color: getTextColor(segmentColors[index])
                    }}
                  >
                    {opt}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 每行输入一个选项</p>
          <p>• 点击"开始抽奖"按钮，转盘会自动旋转并随机停止</p>
          <p>• 支持2-20个选项</p>
          <p>• 适用于幸运抽奖、随机选择等场景</p>
        </CardContent>
      </Card>
    </div>
  );
}
