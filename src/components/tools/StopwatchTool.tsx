import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

export function StopwatchTool() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const addLap = () => {
    setLaps([time, ...laps]);
  };

  const reset = () => {
    setTime(0);
    setLaps([]);
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Timer className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">秒表</CardTitle>
              <CardDescription className="mt-1">
                精确计时，支持记录圈数
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-8">
            <div className="text-8xl font-bold font-mono tabular-nums">
              {formatTime(time)}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                size="lg"
                className="w-32"
              >
                {isRunning ? (
                  <>
                    <Icons.Pause className="w-5 h-5 mr-2" />
                    暂停
                  </>
                ) : (
                  <>
                    <Icons.Play className="w-5 h-5 mr-2" />
                    开始
                  </>
                )}
              </Button>
              <Button onClick={addLap} disabled={!isRunning} size="lg" variant="outline">
                <Icons.Flag className="w-5 h-5 mr-2" />
                记圈
              </Button>
              <Button onClick={reset} size="lg" variant="outline">
                <Icons.RotateCcw className="w-5 h-5 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {laps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">圈数记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {laps.map((lap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <Badge variant="outline">圈 {laps.length - index}</Badge>
                  <span className="text-lg font-mono">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
