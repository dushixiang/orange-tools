import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

export function CoinFlipTool() {
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<('heads' | 'tails')[]>([]);

  const flip = () => {
    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const newResult = Math.random() > 0.5 ? 'heads' : 'tails';
      setResult(newResult);
      setHistory([newResult, ...history.slice(0, 9)]);
      setIsFlipping(false);
    }, 1000);
  };

  const stats = {
    heads: history.filter(r => r === 'heads').length,
    tails: history.filter(r => r === 'tails').length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Circle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">抛硬币</CardTitle>
              <CardDescription className="mt-1">
                随机决策工具，正面或反面
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-8">
            {/* 硬币动画 */}
            <div className="flex justify-center perspective-1000">
              <div
                className={`w-40 h-40 rounded-full border-8 flex items-center justify-center text-4xl font-bold ${
                  isFlipping
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-yellow-600 animate-[flip_1s_ease-in-out]'
                    : result === 'heads'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                    : result === 'tails'
                    ? 'border-red-500 bg-gradient-to-br from-red-400 to-red-600 text-white'
                    : 'border-gray-300 bg-gradient-to-br from-gray-200 to-gray-400'
                }`}
                style={{
                  animation: isFlipping ? 'flip 1s ease-in-out' : 'none',
                }}
              >
                {!isFlipping && result === 'heads' && '正面'}
                {!isFlipping && result === 'tails' && '反面'}
                {!isFlipping && !result && '?'}
              </div>
            </div>
            
            <style>{`
              @keyframes flip {
                0% { transform: rotateY(0deg) rotateX(0deg); }
                25% { transform: rotateY(180deg) rotateX(180deg); }
                50% { transform: rotateY(360deg) rotateX(360deg); }
                75% { transform: rotateY(540deg) rotateX(540deg); }
                100% { transform: rotateY(720deg) rotateX(720deg); }
              }
            `}</style>

            {result && !isFlipping && (
              <div className="text-3xl font-bold">
                结果: {result === 'heads' ? '正面 🎯' : '反面 🎲'}
              </div>
            )}

            <Button onClick={flip} disabled={isFlipping} size="lg" className="w-48">
              {isFlipping ? (
                <>
                  <Icons.Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  抛掷中...
                </>
              ) : (
                <>
                  <Icons.PlayCircle className="w-5 h-5 mr-2" />
                  抛硬币
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>正面:</span>
                <Badge variant="outline">{stats.heads} 次</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>反面:</span>
                <Badge variant="outline">{stats.tails} 次</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>总计:</span>
                <Badge>{history.length} 次</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">历史记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {history.map((item, index) => (
                  <Badge
                    key={index}
                    variant={item === 'heads' ? 'default' : 'secondary'}
                  >
                    {item === 'heads' ? '正' : '反'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
