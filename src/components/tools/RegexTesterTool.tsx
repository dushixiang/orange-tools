import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
  namedGroups: Record<string, string>;
}

interface RegexState {
  pattern: string;
  flags: {
    global: boolean;
    ignoreCase: boolean;
    multiline: boolean;
    dotAll: boolean;
    unicode: boolean;
    sticky: boolean;
  };
  testString: string;
  matches: RegexMatch[];
  error: string | null;
  isValid: boolean;
}

export function RegexTesterTool() {
  const [state, setState] = useState<RegexState>({
    pattern: '\\b\\w+@\\w+\\.\\w+\\b',
    flags: {
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false
    },
    testString: 'Contact us at: john@example.com or support@company.org for help.',
    matches: [],
    error: null,
    isValid: true
  });

  const testRegex = () => {
    try {
      if (!state.pattern.trim()) {
        setState(prev => ({ 
          ...prev, 
          matches: [], 
          error: null, 
          isValid: true 
        }));
        return;
      }

      const flagsString = Object.entries(state.flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => {
          switch (flag) {
            case 'global': return 'g';
            case 'ignoreCase': return 'i';
            case 'multiline': return 'm';
            case 'dotAll': return 's';
            case 'unicode': return 'u';
            case 'sticky': return 'y';
            default: return '';
          }
        })
        .join('');

      const regex = new RegExp(state.pattern, flagsString);
      const matches: RegexMatch[] = [];

      if (state.flags.global) {
        let match;
        while ((match = regex.exec(state.testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
          
          // 防止无限循环
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(state.testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {}
          });
        }
      }

      setState(prev => ({
        ...prev,
        matches,
        error: null,
        isValid: true
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        matches: [],
        error: error instanceof Error ? error.message : '正则表达式错误',
        isValid: false
      }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(testRegex, 300);
    return () => clearTimeout(timeoutId);
  }, [state.pattern, state.flags, state.testString]);

  const toggleFlag = (flag: keyof typeof state.flags) => {
    setState(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        [flag]: !prev.flags[flag]
      }
    }));
  };

  const highlightMatches = (text: string, matches: RegexMatch[]) => {
    if (matches.length === 0) return text;

    const parts: { text: string; isMatch: boolean; matchIndex?: number }[] = [];
    let lastIndex = 0;

    matches.forEach((match, matchIndex) => {
      // 添加匹配前的文本
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          isMatch: false
        });
      }

      // 添加匹配的文本
      parts.push({
        text: match.match,
        isMatch: true,
        matchIndex
      });

      lastIndex = match.index + match.match.length;
    });

    // 添加最后剩余的文本
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        isMatch: false
      });
    }

    return parts.map((part, index) => (
      <span
        key={index}
        className={part.isMatch 
          ? 'bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-semibold' 
          : ''
        }
        title={part.isMatch ? `匹配 ${part.matchIndex! + 1}` : undefined}
      >
        {part.text}
      </span>
    ));
  };

  const commonPatterns = [
    { name: '邮箱地址', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' },
    { name: '手机号码', pattern: '1[3-9]\\d{9}' },
    { name: 'URL链接', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'IP地址', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
    { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: '时间 (HH:MM)', pattern: '\\d{2}:\\d{2}' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '数字', pattern: '\\d+' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">正则表达式测试器</CardTitle>
                <CardDescription className="mt-1">
                  测试和调试正则表达式，实时查看匹配结果和捕获组
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 正则表达式输入区域 */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icons.Code className="w-4 h-4" />
                  正则表达式
                </CardTitle>
                <div className="flex gap-2">
                  {state.error && (
                    <Badge variant="destructive" className="text-xs">
                      <Icons.AlertCircle className="w-3 h-3 mr-1" />
                      错误
                    </Badge>
                  )}
                  {state.isValid && state.matches.length > 0 && (
                    <Badge variant="default" className="text-xs">
                      <Icons.CheckCircle className="w-3 h-3 mr-1" />
                      {state.matches.length} 个匹配
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-mono">
                    /
                  </span>
                  <Input
                    value={state.pattern}
                    onChange={(e) => setState(prev => ({ ...prev, pattern: e.target.value }))}
                    className={`pl-8 pr-16 font-mono ${state.error ? 'border-destructive' : ''}`}
                    placeholder="输入正则表达式..."
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-mono text-sm">
                    /{Object.entries(state.flags).filter(([_, enabled]) => enabled).map(([flag, _]) => {
                      switch (flag) {
                        case 'global': return 'g';
                        case 'ignoreCase': return 'i';
                        case 'multiline': return 'm';
                        case 'dotAll': return 's';
                        case 'unicode': return 'u';
                        case 'sticky': return 'y';
                        default: return '';
                      }
                    }).join('')}
                  </span>
                </div>
                {state.error && (
                  <p className="text-sm text-destructive mt-1">{state.error}</p>
                )}
              </div>

              {/* 标志选项 */}
              <div>
                <label className="text-sm font-medium mb-2 block">标志</label>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(state.flags).map(([flag, enabled]) => (
                    <Button
                      key={flag}
                      variant={enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFlag(flag as keyof typeof state.flags)}
                      className="justify-start text-xs h-8"
                    >
                      <span className="font-mono mr-1">
                        {flag === 'global' && 'g'}
                        {flag === 'ignoreCase' && 'i'}
                        {flag === 'multiline' && 'm'}
                        {flag === 'dotAll' && 's'}
                        {flag === 'unicode' && 'u'}
                        {flag === 'sticky' && 'y'}
                      </span>
                      {flag === 'global' && '全局'}
                      {flag === 'ignoreCase' && '忽略大小写'}
                      {flag === 'multiline' && '多行'}
                      {flag === 'dotAll' && '点匹配所有'}
                      {flag === 'unicode' && 'Unicode'}
                      {flag === 'sticky' && '粘性'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 测试文本区域 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.FileText className="w-4 h-4" />
                测试文本
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={state.testString}
                onChange={(e) => setState(prev => ({ ...prev, testString: e.target.value }))}
                placeholder="输入要测试的文本..."
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-2">
                字符数: {state.testString.length}
              </div>
            </CardContent>
          </Card>

          {/* 匹配结果高亮显示 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Eye className="w-4 h-4" />
                匹配高亮
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted/30 rounded-lg min-h-[120px] font-mono text-sm whitespace-pre-wrap break-words">
                {state.testString ? highlightMatches(state.testString, state.matches) : (
                  <span className="text-muted-foreground italic">输入测试文本查看匹配结果...</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 匹配详情 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.List className="w-4 h-4" />
                匹配详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.matches.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {state.matches.slice(0, 5).map((match, index) => (
                    <div key={index} className="p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          匹配 {index + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          位置: {match.index}
                        </span>
                      </div>
                      <div className="font-mono text-xs bg-background p-1 rounded border">
                        {match.match}
                      </div>
                      {match.groups.length > 0 && (
                        <div className="mt-1">
                          <div className="text-xs font-medium mb-1">捕获组:</div>
                          {match.groups.slice(0, 2).map((group, groupIndex) => (
                            <div key={groupIndex} className="text-xs font-mono bg-background p-1 rounded border mb-1">
                              ${groupIndex + 1}: {group || '(空)'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {state.matches.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      还有 {state.matches.length - 5} 个匹配...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  <Icons.Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">暂无匹配结果</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 常用模式 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Bookmark className="w-4 h-4" />
                常用模式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {commonPatterns.slice(0, 6).map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => setState(prev => ({ ...prev, pattern: item.pattern }))}
                  >
                    <div>
                      <div className="font-medium text-xs">{item.name}</div>
                      <div className="font-mono text-xs text-muted-foreground truncate">
                        {item.pattern.length > 20 ? item.pattern.substring(0, 20) + '...' : item.pattern}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icons.Info className="w-5 h-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">常用元字符</h4>
              <ul className="space-y-1 text-muted-foreground font-mono">
                <li>• <code>.</code> - 匹配任意字符（除换行符）</li>
                <li>• <code>*</code> - 匹配前面的字符0次或多次</li>
                <li>• <code>+</code> - 匹配前面的字符1次或多次</li>
                <li>• <code>?</code> - 匹配前面的字符0次或1次</li>
                <li>• <code>^</code> - 匹配行的开始</li>
                <li>• <code>$</code> - 匹配行的结束</li>
                <li>• <code>\\d</code> - 匹配数字</li>
                <li>• <code>\\w</code> - 匹配字母、数字、下划线</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">标志说明</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>g</strong> - 全局匹配，查找所有匹配项</li>
                <li>• <strong>i</strong> - 忽略大小写</li>
                <li>• <strong>m</strong> - 多行模式，^和$匹配每行</li>
                <li>• <strong>s</strong> - 点号匹配所有字符包括换行符</li>
                <li>• <strong>u</strong> - Unicode模式</li>
                <li>• <strong>y</strong> - 粘性匹配</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}