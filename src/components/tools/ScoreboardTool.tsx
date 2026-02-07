import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Icons from 'lucide-react';

export function ScoreboardTool() {
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [redName, setRedName] = useState('红队');
  const [blueName, setBlueName] = useState('蓝队');
  const [history, setHistory] = useState<{ team: string; action: string; time: number }[]>([]);

  const addScore = (team: 'red' | 'blue', points: number) => {
    if (team === 'red') {
      setRedScore(redScore + points);
    } else {
      setBlueScore(blueScore + points);
    }
    setHistory([
      { team: team === 'red' ? redName : blueName, action: `+${points}`, time: Date.now() },
      ...history.slice(0, 9)
    ]);
  };

  const reset = () => {
    setRedScore(0);
    setBlueScore(0);
    setHistory([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">记分板</CardTitle>
                <CardDescription className="mt-1">
                  适用于运动比赛、游戏对战等场景
                </CardDescription>
              </div>
            </div>
            <Button onClick={reset} variant="outline">
              <Icons.RotateCcw className="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 主记分区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 红队 */}
        <Card className="border-red-300 dark:border-red-700">
          <CardHeader className="bg-red-100 dark:bg-red-900/20">
            <div className="flex items-center justify-center">
              <Input
                value={redName}
                onChange={(e) => setRedName(e.target.value)}
                className="text-center text-2xl font-bold border-0 bg-transparent"
                maxLength={10}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-[200px] font-bold text-red-600 dark:text-red-400 mb-10 leading-none tabular-nums">
                {redScore}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  onClick={() => addScore('red', 1)}
                  size="sm"
                  className="h-10 text-base bg-red-600 hover:bg-red-700"
                >
                  +1
                </Button>
                <Button
                  onClick={() => addScore('red', 2)}
                  size="sm"
                  className="h-10 text-base bg-red-600 hover:bg-red-700"
                >
                  +2
                </Button>
                <Button
                  onClick={() => addScore('red', 3)}
                  size="sm"
                  className="h-10 text-base bg-red-600 hover:bg-red-700"
                >
                  +3
                </Button>
                <Button
                  onClick={() => addScore('red', -1)}
                  size="sm"
                  variant="outline"
                  className="h-8 text-sm col-span-3"
                >
                  -1
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 蓝队 */}
        <Card className="border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100 dark:bg-blue-900/20">
            <div className="flex items-center justify-center">
              <Input
                value={blueName}
                onChange={(e) => setBlueName(e.target.value)}
                className="text-center text-2xl font-bold border-0 bg-transparent"
                maxLength={10}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-[200px] font-bold text-blue-600 dark:text-blue-400 mb-10 leading-none tabular-nums">
                {blueScore}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  onClick={() => addScore('blue', 1)}
                  size="sm"
                  className="h-10 text-base bg-blue-600 hover:bg-blue-700"
                >
                  +1
                </Button>
                <Button
                  onClick={() => addScore('blue', 2)}
                  size="sm"
                  className="h-10 text-base bg-blue-600 hover:bg-blue-700"
                >
                  +2
                </Button>
                <Button
                  onClick={() => addScore('blue', 3)}
                  size="sm"
                  className="h-10 text-base bg-blue-600 hover:bg-blue-700"
                >
                  +3
                </Button>
                <Button
                  onClick={() => addScore('blue', -1)}
                  size="sm"
                  variant="outline"
                  className="h-8 text-sm col-span-3"
                >
                  -1
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 比分历史 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">得分历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{record.team}</span>
                    <span className="text-lg">{record.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(record.time).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 点击队伍名称可以修改队名</p>
          <p>• 点击分数按钮为对应队伍加分</p>
          <p>• 支持全屏显示，适合投影演示</p>
          <p>• 记录最近10次得分历史</p>
        </CardContent>
      </Card>
    </div>
  );
}
