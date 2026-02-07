import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface CronField {
  name: string;
  value: string;
  description: string;
  range: string;
  specialChars: string;
}

interface CronState {
  expression: string;
  fields: CronField[];
  nextRuns: Date[];
  error: string | null;
  isValid: boolean;
  description: string;
}

export function CronParserTool() {
  const [state, setState] = useState<CronState>({
    expression: '0 9 * * 1-5',
    fields: [],
    nextRuns: [],
    error: null,
    isValid: false,
    description: ''
  });

  const fieldNames = ['分钟', '小时', '日', '月', '星期'];
  const fieldRanges = ['0-59', '0-23', '1-31', '1-12', '0-7'];
  const fieldDescriptions = [
    '分钟 (0-59)',
    '小时 (0-23)',
    '日 (1-31)',
    '月 (1-12)',
    '星期 (0-7, 0和7都表示周日)'
  ];

  const parseCronExpression = (expression: string) => {
    const parts = expression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      throw new Error('Cron 表达式必须包含 5 个字段：分钟 小时 日 月 星期');
    }

    const fields: CronField[] = parts.map((part, index) => ({
      name: fieldNames[index],
      value: part,
      description: fieldDescriptions[index],
      range: fieldRanges[index],
      specialChars: '* , - / ?'
    }));

    return fields;
  };

  const describeCronField = (value: string, fieldIndex: number): string => {
    if (value === '*') {
      return fieldIndex === 4 ? '每天' : '每' + fieldNames[fieldIndex];
    }
    
    if (value === '?') {
      return '任意';
    }

    if (value.includes('/')) {
      const [range, step] = value.split('/');
      const stepNum = parseInt(step);
      if (range === '*') {
        return `每${stepNum}${fieldNames[fieldIndex]}`;
      } else {
        return `从${range}开始，每${stepNum}${fieldNames[fieldIndex]}`;
      }
    }

    if (value.includes('-')) {
      const [start, end] = value.split('-');
      return `从${start}到${end}`;
    }

    if (value.includes(',')) {
      const values = value.split(',');
      return `在${values.join('、')}`;
    }

    return value;
  };

  const generateDescription = (fields: CronField[]): string => {
    const descriptions = fields.map((field, index) => 
      describeCronField(field.value, index)
    );

    // 构建人性化描述
    let desc = '在';
    
    // 星期
    if (fields[4].value !== '*') {
      desc += describeCronField(fields[4].value, 4);
    } else {
      desc += '每天';
    }

    // 月份
    if (fields[3].value !== '*') {
      desc += '的' + describeCronField(fields[3].value, 3) + '月';
    }

    // 日期
    if (fields[2].value !== '*') {
      desc += '的' + describeCronField(fields[2].value, 2) + '日';
    }

    // 时间
    desc += '的' + describeCronField(fields[1].value, 1) + '时';
    desc += describeCronField(fields[0].value, 0) + '分';

    desc += '执行';

    return desc;
  };

  const calculateNextRuns = (expression: string, count: number = 10): Date[] => {
    try {
      const parts = expression.trim().split(/\s+/);
      if (parts.length !== 5) return [];

      const [minute, hour, day, month, weekday] = parts;
      const now = new Date();
      const nextRuns: Date[] = [];
      
      // 简化的计算逻辑（实际项目中建议使用专业的 cron 库）
      let current = new Date(now);
      current.setSeconds(0, 0);
      
      for (let i = 0; i < count && nextRuns.length < count; i++) {
        current = new Date(current.getTime() + 60000); // 增加1分钟
        
        const currentMinute = current.getMinutes();
        const currentHour = current.getHours();
        const currentDay = current.getDate();
        const currentMonth = current.getMonth() + 1;
        const currentWeekday = current.getDay();

        // 检查分钟
        if (!matchesCronField(minute, currentMinute, 0, 59)) continue;
        
        // 检查小时
        if (!matchesCronField(hour, currentHour, 0, 23)) continue;
        
        // 检查日期
        if (!matchesCronField(day, currentDay, 1, 31)) continue;
        
        // 检查月份
        if (!matchesCronField(month, currentMonth, 1, 12)) continue;
        
        // 检查星期
        if (!matchesCronField(weekday, currentWeekday, 0, 7)) continue;

        nextRuns.push(new Date(current));
      }

      return nextRuns;
    } catch (error) {
      return [];
    }
  };

  const matchesCronField = (cronField: string, value: number, min: number, max: number): boolean => {
    if (cronField === '*' || cronField === '?') return true;

    if (cronField.includes(',')) {
      return cronField.split(',').some(part => matchesCronField(part.trim(), value, min, max));
    }

    if (cronField.includes('/')) {
      const [range, step] = cronField.split('/');
      const stepNum = parseInt(step);
      if (range === '*') {
        return value % stepNum === 0;
      } else {
        const rangeStart = parseInt(range);
        return value >= rangeStart && (value - rangeStart) % stepNum === 0;
      }
    }

    if (cronField.includes('-')) {
      const [start, end] = cronField.split('-');
      const startNum = parseInt(start);
      const endNum = parseInt(end);
      return value >= startNum && value <= endNum;
    }

    return parseInt(cronField) === value;
  };

  const parseCron = () => {
    try {
      if (!state.expression.trim()) {
        setState(prev => ({
          ...prev,
          fields: [],
          nextRuns: [],
          error: null,
          isValid: false,
          description: ''
        }));
        return;
      }

      const fields = parseCronExpression(state.expression);
      const description = generateDescription(fields);
      const nextRuns = calculateNextRuns(state.expression);

      setState(prev => ({
        ...prev,
        fields,
        nextRuns,
        error: null,
        isValid: true,
        description
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        fields: [],
        nextRuns: [],
        error: error instanceof Error ? error.message : 'Cron 表达式解析失败',
        isValid: false,
        description: ''
      }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(parseCron, 300);
    return () => clearTimeout(timeoutId);
  }, [state.expression]);

  const commonExpressions = [
    { name: '每分钟', expression: '* * * * *' },
    { name: '每小时', expression: '0 * * * *' },
    { name: '每天午夜', expression: '0 0 * * *' },
    { name: '每天上午9点', expression: '0 9 * * *' },
    { name: '工作日上午9点', expression: '0 9 * * 1-5' },
    { name: '每周一上午9点', expression: '0 9 * * 1' },
    { name: '每月1号午夜', expression: '0 0 1 * *' },
    { name: '每15分钟', expression: '*/15 * * * *' },
    { name: '每2小时', expression: '0 */2 * * *' },
    { name: '每天上午9点和下午5点', expression: '0 9,17 * * *' }
  ];

  const formatDate = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Cron 表达式解析器</CardTitle>
                <CardDescription className="mt-1">
                  解析和验证 Cron 表达式，预测执行时间和生成人性化描述
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Cron 表达式输入区域 */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.Terminal className="w-4 h-4" />
                  Cron 表达式
                </CardTitle>
                <div className="flex gap-2">
                  {state.error && (
                    <Badge variant="destructive" className="text-xs">
                      <Icons.AlertCircle className="w-3 h-3 mr-1" />
                      无效
                    </Badge>
                  )}
                  {state.isValid && (
                    <Badge variant="default" className="text-xs">
                      <Icons.CheckCircle className="w-3 h-3 mr-1" />
                      有效
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Input
                  value={state.expression}
                  onChange={(e) => setState(prev => ({ ...prev, expression: e.target.value }))}
                  placeholder="输入 Cron 表达式，如: 0 9 * * 1-5"
                  className={`font-mono text-base ${state.error ? 'border-destructive' : ''}`}
                />
                {state.error && (
                  <p className="text-sm text-destructive mt-1">{state.error}</p>
                )}
                {state.isValid && state.description && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    <Icons.Info className="w-3 h-3 inline mr-1" />
                    {state.description}
                  </p>
                )}
              </div>

              {/* 字段解析 */}
              {state.fields.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">字段解析</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {state.fields.map((field, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-muted/30 p-2 rounded-lg">
                          <div className="font-mono text-base font-bold">{field.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{field.name}</div>
                          <div className="text-xs text-muted-foreground">{field.range}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 下次执行时间 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Calendar className="w-4 h-4" />
                下次执行时间
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.nextRuns.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {state.nextRuns.slice(0, 8).map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                      <span className="font-mono">{formatDate(date)}</span>
                      <Badge variant="outline" className="text-xs">
                        第 {index + 1} 次
                      </Badge>
                    </div>
                  ))}
                  {state.nextRuns.length > 8 && (
                    <div className="text-xs text-muted-foreground text-center">
                      还有 {state.nextRuns.length - 8} 个执行时间...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  <Icons.Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">输入有效的 Cron 表达式查看执行时间</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 常用表达式 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Bookmark className="w-4 h-4" />
                常用表达式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {commonExpressions.slice(0, 8).map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => setState(prev => ({ ...prev, expression: item.expression }))}
                  >
                    <div>
                      <div className="font-medium text-xs">{item.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.expression}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 字段说明 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.HelpCircle className="w-4 h-4" />
                字段说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="font-semibold mb-1">字段顺序</div>
                  <div className="font-mono text-xs bg-muted/30 p-2 rounded">
                    分钟 小时 日 月 星期
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold mb-1">特殊字符</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <code>*</code> - 任意值</li>
                    <li>• <code>,</code> - 值列表分隔符</li>
                    <li>• <code>-</code> - 范围</li>
                    <li>• <code>/</code> - 步长</li>
                  </ul>
                </div>

                <div>
                  <div className="font-semibold mb-1">示例</div>
                  <ul className="space-y-1 text-muted-foreground font-mono text-xs">
                    <li>• <code>*/5</code> - 每5个单位</li>
                    <li>• <code>1-5</code> - 1到5</li>
                    <li>• <code>1,3,5</code> - 1、3、5</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}