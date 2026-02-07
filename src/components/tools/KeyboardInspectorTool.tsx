import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface KeyEvent {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  timestamp: number;
}

export function KeyboardInspectorTool() {
  const [currentEvent, setCurrentEvent] = useState<KeyEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<KeyEvent[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 阻止某些默认行为，但不影响正常使用
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        // 允许刷新
        return;
      }
      
      const keyEvent: KeyEvent = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        timestamp: Date.now(),
      };

      setCurrentEvent(keyEvent);
      setEventHistory(prev => [keyEvent, ...prev.slice(0, 9)]); // 保留最近10个事件
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getModifierKeys = (event: KeyEvent) => {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    return modifiers.length > 0 ? modifiers.join(' + ') : '无';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Keyboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">键盘事件检测器</CardTitle>
              <CardDescription className="mt-1">
                按下任意键查看详细的键盘事件信息
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 提示区域 */}
      {!currentEvent && (
        <Card className="border-dashed">
          <CardContent className="py-20">
            <div className="text-center">
              <Icons.Keyboard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">按下任意键开始检测</p>
              <p className="text-sm text-muted-foreground mt-2">键盘事件信息将实时显示在下方</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 当前按键信息 */}
      {currentEvent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{currentEvent.key}</div>
              <p className="text-xs text-muted-foreground mt-1">按键值</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono">{currentEvent.code}</div>
              <p className="text-xs text-muted-foreground mt-1">物理位置代码</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">KeyCode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono">{currentEvent.keyCode}</div>
              <p className="text-xs text-muted-foreground mt-1">已废弃的键码</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">修饰键</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-mono">{getModifierKeys(currentEvent)}</div>
              <p className="text-xs text-muted-foreground mt-1">组合键状态</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细信息 */}
      {currentEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">完整事件信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">key</div>
                <div className="font-mono bg-muted/30 p-2 rounded">{currentEvent.key}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">code</div>
                <div className="font-mono bg-muted/30 p-2 rounded">{currentEvent.code}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">keyCode</div>
                <div className="font-mono bg-muted/30 p-2 rounded">{currentEvent.keyCode}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">which</div>
                <div className="font-mono bg-muted/30 p-2 rounded">{currentEvent.which}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">altKey</div>
                <Badge variant={currentEvent.altKey ? 'default' : 'secondary'}>
                  {currentEvent.altKey ? 'true' : 'false'}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">ctrlKey</div>
                <Badge variant={currentEvent.ctrlKey ? 'default' : 'secondary'}>
                  {currentEvent.ctrlKey ? 'true' : 'false'}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">shiftKey</div>
                <Badge variant={currentEvent.shiftKey ? 'default' : 'secondary'}>
                  {currentEvent.shiftKey ? 'true' : 'false'}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">metaKey</div>
                <Badge variant={currentEvent.metaKey ? 'default' : 'secondary'}>
                  {currentEvent.metaKey ? 'true' : 'false'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 事件历史 */}
      {eventHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">事件历史 (最近 10 个)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eventHistory.map((event, index) => (
                <div
                  key={event.timestamp}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-mono font-semibold">{event.key}</span>
                    <span className="text-muted-foreground font-mono">{event.code}</span>
                    {(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) && (
                      <span className="text-xs text-muted-foreground">+ {getModifierKeys(event)}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            属性说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">推荐使用的属性</h4>
              <ul className="space-y-1">
                <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">key</code> - 按键的字符值，推荐使用</li>
                <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">code</code> - 物理按键位置，与布局无关</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">已废弃的属性</h4>
              <ul className="space-y-1">
                <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">keyCode</code> - 已废弃，不推荐使用</li>
                <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">which</code> - 已废弃，不推荐使用</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：不同操作系统和浏览器的键盘事件可能有所差异，此工具可以帮助您调试键盘相关功能。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
