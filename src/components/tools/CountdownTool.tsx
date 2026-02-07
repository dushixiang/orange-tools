import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Icons from 'lucide-react';

export function CountdownTool() {
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a').play().catch(() => {});
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const start = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">倒数计时器</CardTitle>
              <CardDescription className="mt-1">
                设置倒计时时间，到时提醒
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-8">
            <div className="text-9xl font-bold font-mono tabular-nums">
              {timeLeft > 0 ? formatTime(timeLeft) : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </div>

            {!isRunning && timeLeft === 0 && (
              <div className="flex justify-center gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">分钟</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">秒</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                    className="w-24 text-center text-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button onClick={start} disabled={isRunning} size="lg" className="w-32">
                {isRunning ? <Icons.Pause className="w-5 h-5 mr-2" /> : <Icons.Play className="w-5 h-5 mr-2" />}
                {isRunning ? '暂停' : '开始'}
              </Button>
              <Button onClick={() => setIsRunning(false)} disabled={!isRunning} size="lg" variant="outline">
                <Icons.Pause className="w-5 h-5 mr-2" />
                暂停
              </Button>
              <Button onClick={reset} size="lg" variant="outline">
                <Icons.RotateCcw className="w-5 h-5 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
