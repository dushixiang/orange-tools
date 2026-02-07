import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Icons from 'lucide-react';

export function CounterTool() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Hash className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">计数器</CardTitle>
              <CardDescription className="mt-1">
                用于计数进出人数、比赛得分等
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-8">
            <div className="text-[150px] font-bold leading-none tabular-nums">
              {count}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setCount(count - step)}
                size="lg"
                variant="outline"
                className="h-24 w-24 text-3xl"
              >
                <Icons.Minus className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => setCount(count + step)}
                size="lg"
                className="h-24 w-24 text-3xl"
              >
                <Icons.Plus className="w-8 h-8" />
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">步长:</label>
                <Input
                  type="number"
                  min="1"
                  value={step}
                  onChange={(e) => setStep(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
              </div>
              <Button onClick={() => setCount(0)} variant="outline">
                <Icons.RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
