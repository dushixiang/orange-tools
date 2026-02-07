import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export function PomodoroTool() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [currentMode, setCurrentMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // 播放提示音
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBClxw/DOczEGH2q46+WPNwgbZ7Ll7KJWEA1Wo+TvuW4fBzGH0fPTgjMGKHO/796ROwkVYLbp66NUEgpJn+DyvWwhBChuw/PMdjEGH2m56+WPNwkaZrPl7KJWEA1Vo+Tvum4fBzKH0fPSgjMGJ3O/796SOwkUYbbp66RUEgpKn+HywmwhBCduw/PLdjEGHmq56+aSNwkaZ7Pl7aJWEA1Xo+Tvu24fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEgpLnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWshBCduw/PLdjEGHmu56+aSNwkaZrPl7aJWEA1Xo+Tvum4fBzOH0fPSgjQGJ3S/796SOwkUYrfq66NUEQpMnuDyvWsh');
    audio.play().catch(() => {});

    if (currentMode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // 每4个番茄钟后长休息
      if (newCount % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  };

  const switchMode = (mode: TimerMode) => {
    setCurrentMode(mode);
    const minutes = mode === 'work' ? workMinutes : mode === 'shortBreak' ? shortBreakMinutes : longBreakMinutes;
    setTimeLeft(minutes * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const minutes = currentMode === 'work' ? workMinutes : currentMode === 'shortBreak' ? shortBreakMinutes : longBreakMinutes;
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    work: { label: '专注工作', color: 'bg-red-100 dark:bg-red-900/20 border-red-500', icon: Icons.Coffee },
    shortBreak: { label: '短休息', color: 'bg-green-100 dark:bg-green-900/20 border-green-500', icon: Icons.Leaf },
    longBreak: { label: '长休息', color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-500', icon: Icons.Moon },
  };

  const CurrentIcon = modeConfig[currentMode].icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Timer className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">番茄钟</CardTitle>
              <CardDescription className="mt-1">
                使用番茄工作法提升专注力和工作效率
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 主计时器 */}
      <Card className={`${modeConfig[currentMode].color} border-2`}>
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <CurrentIcon className="w-8 h-8" />
              <h2 className="text-2xl font-semibold">{modeConfig[currentMode].label}</h2>
            </div>
            
            <div className="text-9xl font-bold font-mono tabular-nums">
              {formatTime(timeLeft)}
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={toggleTimer} size="lg" className="w-32">
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
              <Button onClick={resetTimer} size="lg" variant="outline">
                <Icons.RotateCcw className="w-5 h-5 mr-2" />
                重置
              </Button>
            </div>

            <div className="flex justify-center gap-2">
              {['work', 'shortBreak', 'longBreak'].map((mode) => (
                <Button
                  key={mode}
                  variant={currentMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    switchMode(mode as TimerMode);
                    setIsRunning(false);
                  }}
                  disabled={isRunning}
                >
                  {modeConfig[mode as TimerMode].label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计和设置 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">今日完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <Icons.CheckCircle2 className="w-12 h-12 text-green-600" />
              <div>
                <div className="text-4xl font-bold">{completedPomodoros}</div>
                <div className="text-sm text-muted-foreground">个番茄钟</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">时间设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">工作时长</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={workMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 25;
                    setWorkMinutes(val);
                    if (currentMode === 'work' && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-20 text-center"
                  disabled={isRunning}
                />
                <span className="text-sm text-muted-foreground">分钟</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">短休息</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 5;
                    setShortBreakMinutes(val);
                    if (currentMode === 'shortBreak' && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-20 text-center"
                  disabled={isRunning}
                />
                <span className="text-sm text-muted-foreground">分钟</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">长休息</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 15;
                    setLongBreakMinutes(val);
                    if (currentMode === 'longBreak' && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-20 text-center"
                  disabled={isRunning}
                />
                <span className="text-sm text-muted-foreground">分钟</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            番茄工作法说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 专注工作25分钟，然后休息5分钟，这是一个完整的番茄钟</p>
          <p>• 完成4个番茄钟后，进行15-30分钟的长休息</p>
          <p>• 在专注时间内，尽量避免被打扰，全神贯注完成任务</p>
          <p>• 利用休息时间放松身心，为下一轮工作做准备</p>
        </CardContent>
      </Card>
    </div>
  );
}
