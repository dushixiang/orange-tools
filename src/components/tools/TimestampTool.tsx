import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface TimestampToolState {
  timestamp: string;
  datetime: string;
  timezone: string;
  format: string;
  error?: string;
}

export function TimestampTool() {
  const [state, setState] = useState<TimestampToolState>({
    timestamp: '',
    datetime: '',
    timezone: 'Asia/Shanghai',
    format: 'YYYY-MM-DD HH:mm:ss'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 时间戳转日期时间
  const timestampToDatetime = useCallback((timestamp: string): string => {
    try {
      if (!timestamp.trim()) return '';
      
      let ts = parseFloat(timestamp);
      
      // 自动检测时间戳格式（秒或毫秒）
      if (ts < 10000000000) {
        // 10位时间戳，秒级
        ts = ts * 1000;
      }
      
      const date = new Date(ts);
      
      if (isNaN(date.getTime())) {
        throw new Error('无效的时间戳');
      }
      
      // 根据时区转换
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: state.timezone,
        hour12: false
      };
      
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    } catch (error) {
      throw new Error('时间戳格式错误');
    }
  }, [state.timezone]);

  // 日期时间转时间戳
  const datetimeToTimestamp = useCallback((datetime: string): string => {
    try {
      if (!datetime.trim()) return '';
      
      const date = new Date(datetime);
      
      if (isNaN(date.getTime())) {
        throw new Error('无效的日期时间格式');
      }
      
      return Math.floor(date.getTime() / 1000).toString();
    } catch (error) {
      throw new Error('日期时间格式错误');
    }
  }, []);

  // 处理时间戳输入变化
  const handleTimestampChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, timestamp: value, error: undefined }));
    
    if (value.trim()) {
      try {
        const datetime = timestampToDatetime(value);
        setState(prev => ({ ...prev, datetime, error: undefined }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          datetime: '',
          error: error instanceof Error ? error.message : '转换失败' 
        }));
      }
    } else {
      setState(prev => ({ ...prev, datetime: '', error: undefined }));
    }
  }, [timestampToDatetime]);

  // 处理日期时间输入变化
  const handleDatetimeChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, datetime: value, error: undefined }));
    
    if (value.trim()) {
      try {
        const timestamp = datetimeToTimestamp(value);
        setState(prev => ({ ...prev, timestamp, error: undefined }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          timestamp: '',
          error: error instanceof Error ? error.message : '转换失败' 
        }));
      }
    } else {
      setState(prev => ({ ...prev, timestamp: '', error: undefined }));
    }
  }, [datetimeToTimestamp]);

  // 获取当前时间戳
  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    handleTimestampChange(now.toString());
  };

  // 获取当前日期时间
  const getCurrentDatetime = () => {
    const now = new Date();
    const datetime = now.toISOString().slice(0, 19).replace('T', ' ');
    handleDatetimeChange(datetime);
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 清空内容
  const clearAll = () => {
    setState(prev => ({
      ...prev,
      timestamp: '',
      datetime: '',
      error: undefined
    }));
  };

  // 设置时区
  const setTimezone = (timezone: string) => {
    setState(prev => ({ ...prev, timezone }));
    // 如果有时间戳，重新转换
    if (state.timestamp) {
      try {
        const datetime = timestampToDatetime(state.timestamp);
        setState(prev => ({ ...prev, datetime, error: undefined }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : '转换失败' 
        }));
      }
    }
  };

  // 常用时区列表
  const timezones = [
    { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
    { value: 'UTC', label: 'UTC 时间' },
    { value: 'America/New_York', label: '纽约时间 (UTC-5/-4)' },
    { value: 'Europe/London', label: '伦敦时间 (UTC+0/+1)' },
    { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
    { value: 'America/Los_Angeles', label: '洛杉矶时间 (UTC-8/-7)' }
  ];

  // 格式化当前时间显示
  const formatCurrentTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: state.timezone,
      hour12: false
    };
    
    return new Intl.DateTimeFormat('zh-CN', options).format(currentTime);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">时间戳转换工具</CardTitle>
                <CardDescription className="mt-1">
                  Unix时间戳与日期时间的相互转换，支持多时区
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {state.timezone}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 当前时间显示 */}
      <Card>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-2xl font-mono font-bold text-primary">
              {formatCurrentTime()}
            </div>
            <div className="text-lg font-mono text-muted-foreground">
              {Math.floor(currentTime.getTime() / 1000)}
            </div>
            <div className="text-sm text-muted-foreground">
              当前时间 ({state.timezone})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时区选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">时区设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {timezones.map(tz => (
              <Button
                key={tz.value}
                size="sm"
                variant={state.timezone === tz.value ? 'default' : 'outline'}
                onClick={() => setTimezone(tz.value)}
                className="text-xs"
              >
                {tz.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 转换区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 时间戳输入 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Unix 时间戳</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getCurrentTimestamp}
                >
                  <Icons.RefreshCw className="w-4 h-4 mr-1" />
                  当前
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.timestamp, 'timestamp')}
                  disabled={!state.timestamp}
                >
                  {copySuccess === 'timestamp' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="请输入时间戳 (秒或毫秒)"
              value={state.timestamp}
              onChange={(e) => handleTimestampChange(e.target.value)}
              className="font-mono"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              支持10位(秒)或13位(毫秒)时间戳
            </div>
          </CardContent>
        </Card>

        {/* 日期时间输入 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">日期时间</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getCurrentDatetime}
                >
                  <Icons.RefreshCw className="w-4 h-4 mr-1" />
                  当前
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.datetime, 'datetime')}
                  disabled={!state.datetime}
                >
                  {copySuccess === 'datetime' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="请输入日期时间 (YYYY-MM-DD HH:mm:ss)"
              value={state.datetime}
              onChange={(e) => handleDatetimeChange(e.target.value)}
              className="font-mono"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              格式: YYYY-MM-DD HH:mm:ss 或 ISO 8601
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={getCurrentTimestamp} variant="outline">
              <Icons.Clock className="w-4 h-4 mr-2" />
              获取当前时间戳
            </Button>
            <Button onClick={getCurrentDatetime} variant="outline">
              <Icons.Calendar className="w-4 h-4 mr-2" />
              获取当前日期时间
            </Button>
            <Button onClick={clearAll} variant="outline">
              <Icons.Trash2 className="w-4 h-4 mr-2" />
              清空内容
            </Button>
          </div>
          {state.error && (
            <div className="mt-4 text-center text-sm text-destructive flex items-center justify-center">
              <Icons.AlertCircle className="w-4 h-4 mr-1" />
              {state.error}
            </div>
          )}
        </CardContent>
      </Card>

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
              <h4 className="font-medium text-foreground mb-2">时间戳格式</h4>
              <ul className="space-y-1">
                <li>• <strong>10位:</strong> 秒级时间戳 (1640995200)</li>
                <li>• <strong>13位:</strong> 毫秒级时间戳 (1640995200000)</li>
                <li>• 工具会自动识别格式</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">日期时间格式</h4>
              <ul className="space-y-1">
                <li>• YYYY-MM-DD HH:mm:ss</li>
                <li>• ISO 8601: 2022-01-01T12:00:00Z</li>
                <li>• 支持多种标准格式</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：Unix时间戳是从1970年1月1日00:00:00 UTC开始的秒数，广泛用于计算机系统中。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
