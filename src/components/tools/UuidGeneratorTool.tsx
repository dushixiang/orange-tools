import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface UuidGeneratorState {
  uuid: string;
  batchUuids: string[];
  batchCount: number;
  version: 4;
  format: 'default' | 'uppercase' | 'no-hyphen';
}

export function UuidGeneratorTool() {
  const [state, setState] = useState<UuidGeneratorState>({
    uuid: '',
    batchUuids: [],
    batchCount: 10,
    version: 4,
    format: 'default'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // 生成 UUID v4
  const generateUuidV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // 格式化 UUID
  const formatUuid = (uuid: string, format: string): string => {
    switch (format) {
      case 'uppercase':
        return uuid.toUpperCase();
      case 'no-hyphen':
        return uuid.replace(/-/g, '');
      default:
        return uuid;
    }
  };

  // 生成单个 UUID
  const generateSingle = () => {
    const uuid = generateUuidV4();
    const formatted = formatUuid(uuid, state.format);
    setState(prev => ({ ...prev, uuid: formatted }));
  };

  // 生成批量 UUID
  const generateBatch = () => {
    const count = Math.min(Math.max(1, state.batchCount), 1000); // 限制在 1-1000 之间
    const uuids: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const uuid = generateUuidV4();
      const formatted = formatUuid(uuid, state.format);
      uuids.push(formatted);
    }
    
    setState(prev => ({ ...prev, batchUuids: uuids }));
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

  // 设置格式
  const setFormat = (format: 'default' | 'uppercase' | 'no-hyphen') => {
    setState(prev => {
      const newState = { ...prev, format };
      
      // 重新格式化现有的 UUID
      if (prev.uuid) {
        const baseUuid = prev.uuid.toLowerCase().replace(/-/g, '');
        const formatted = baseUuid.match(/.{1,8}/g)?.join('-') || baseUuid;
        const withHyphens = formatted.slice(0, 8) + '-' + formatted.slice(8, 12) + '-' + formatted.slice(12, 16) + '-' + formatted.slice(16, 20) + '-' + formatted.slice(20);
        newState.uuid = formatUuid(withHyphens, format);
      }
      
      if (prev.batchUuids.length > 0) {
        const reformatted = prev.batchUuids.map(uuid => {
          const baseUuid = uuid.toLowerCase().replace(/-/g, '');
          const formatted = baseUuid.slice(0, 8) + '-' + baseUuid.slice(8, 12) + '-' + baseUuid.slice(12, 16) + '-' + baseUuid.slice(16, 20) + '-' + baseUuid.slice(20);
          return formatUuid(formatted, format);
        });
        newState.batchUuids = reformatted;
      }
      
      return newState;
    });
  };

  const batchText = state.batchUuids.join('\n');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">UUID 生成器</CardTitle>
                <CardDescription className="mt-1">
                  生成全局唯一标识符（UUID/GUID），支持批量生成和多种格式
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              UUID v{state.version}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 格式选择 */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">输出格式:</span>
                <Button
                  size="sm"
                  onClick={() => setFormat('default')}
                  variant={state.format === 'default' ? 'default' : 'outline'}
                >
                  小写带连字符
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFormat('uppercase')}
                  variant={state.format === 'uppercase' ? 'default' : 'outline'}
                >
                  大写带连字符
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFormat('no-hyphen')}
                  variant={state.format === 'no-hyphen' ? 'default' : 'outline'}
                >
                  无连字符
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 单个生成 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">单个 UUID 生成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={state.uuid}
                readOnly
                placeholder="点击下方按钮生成 UUID"
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(state.uuid, 'single')}
                disabled={!state.uuid}
              >
                {copySuccess === 'single' ? (
                  <Icons.Check className="w-4 h-4" />
                ) : (
                  <Icons.Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button onClick={generateSingle} className="w-full">
              <Icons.Sparkles className="w-4 h-4 mr-2" />
              生成 UUID
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 批量生成 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">批量 UUID 生成</CardTitle>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">数量:</span>
              <Input
                type="number"
                min="0"
                max="1000"
                value={state.batchCount}
                onChange={(e) => setState(prev => ({ 
                  ...prev, 
                  batchCount: parseInt(e.target.value) || 10 
                }))}
                className="w-24"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={generateBatch} className="flex-1">
                <Icons.Layers className="w-4 h-4 mr-2" />
                生成 {state.batchCount} 个 UUID
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(batchText, 'batch')}
                disabled={state.batchUuids.length === 0}
              >
                {copySuccess === 'batch' ? (
                  <>
                    <Icons.Check className="w-4 h-4 mr-2" />
                    已复制
                  </>
                ) : (
                  <>
                    <Icons.Copy className="w-4 h-4 mr-2" />
                    复制全部
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={batchText}
              readOnly
              placeholder="批量生成的 UUID 将显示在这里，每行一个"
              className="min-h-[300px] font-mono text-sm"
            />
            {state.batchUuids.length > 0 && (
              <div className="text-xs text-muted-foreground">
                已生成 {state.batchUuids.length} 个 UUID
              </div>
            )}
          </div>
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
              <h4 className="font-medium text-foreground mb-2">UUID 说明</h4>
              <ul className="space-y-1">
                <li>• <strong>版本：</strong>UUID v4（随机生成）</li>
                <li>• <strong>格式：</strong>8-4-4-4-12 共36个字符</li>
                <li>• <strong>唯一性：</strong>概率上全球唯一</li>
                <li>• <strong>标准：</strong>遵循 RFC 4122</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• 数据库主键生成</li>
                <li>• 分布式系统唯一标识</li>
                <li>• 文件名或资源标识</li>
                <li>• 临时令牌生成</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：UUID v4 使用随机数生成，碰撞概率极低（约 5.3×10⁻³⁶），适合大多数应用场景。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
