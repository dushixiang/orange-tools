import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { format } from 'sql-formatter';

interface SqlFormatterState {
  input: string;
  output: string;
  language: 'sql' | 'mysql' | 'postgresql' | 'plsql' | 'tsql';
  error?: string;
}

export function SqlFormatterTool() {
  const [state, setState] = useState<SqlFormatterState>({
    input: '',
    output: '',
    language: 'sql'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  const formatSql = useCallback(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, output: '', error: undefined }));
      return;
    }

    try {
      const formatted = format(state.input, {
        language: state.language,
        tabWidth: 2,
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      });

      setState(prev => ({
        ...prev,
        output: formatted,
        error: undefined
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        output: '',
        error: error instanceof Error ? error.message : 'SQL 格式化失败'
      }));
    }
  }, [state.input, state.language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      formatSql();
    }, 300);

    return () => clearTimeout(timer);
  }, [formatSql]);

  const copyToClipboard = async (text: string, type: 'input' | 'output') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      input: '',
      output: '',
      error: undefined
    }));
  };

  const loadExample = () => {
    const example = `select u.id,u.name,u.email,o.order_id,o.total from users u inner join orders o on u.id=o.user_id where o.status='completed' and o.created_at>='2024-01-01' order by o.created_at desc limit 10;`;
    setState(prev => ({ ...prev, input: example, error: undefined }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">SQL 格式化工具</CardTitle>
                <CardDescription className="mt-1">
                  格式化和美化 SQL 语句，支持多种数据库方言
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {state.language.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <select
                value={state.language}
                onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as any }))}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="sql">标准 SQL</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="plsql">PL/SQL (Oracle)</option>
                <option value="tsql">T-SQL (SQL Server)</option>
              </select>
              <Button onClick={loadExample} variant="outline">
                <Icons.FileText className="w-4 h-4 mr-2" />
                加载示例
              </Button>
              <Button onClick={clearAll} variant="outline">
                <Icons.Trash2 className="w-4 h-4 mr-2" />
                清空内容
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要工作区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">SQL 输入</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.input, 'input')}
                  disabled={!state.input}
                >
                  {copySuccess === 'input' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="粘贴要格式化的 SQL 语句..."
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {state.input.length} | 行数: {state.input.split('\n').length}
            </div>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">格式化结果</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.output, 'output')}
                  disabled={!state.output}
                >
                  {copySuccess === 'output' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="格式化后的 SQL 将显示在这里..."
              value={state.output}
              readOnly
              className={`min-h-[300px] font-mono text-sm ${
                state.error ? 'border-destructive' : ''
              }`}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {state.output && (
                  <>
                    字符数: {state.output.length} | 行数: {state.output.split('\n').length}
                  </>
                )}
              </div>
              {state.error && (
                <div className="text-xs text-destructive flex items-center">
                  <Icons.AlertCircle className="w-3 h-3 mr-1" />
                  {state.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">格式化特性</h4>
              <ul className="space-y-1">
                <li>• 关键字自动大写</li>
                <li>• 智能缩进对齐</li>
                <li>• 提高可读性</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">支持的语法</h4>
              <ul className="space-y-1">
                <li>• SELECT、INSERT、UPDATE</li>
                <li>• JOIN、WHERE、GROUP BY</li>
                <li>• 子查询和 CTE</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">数据库方言</h4>
              <ul className="space-y-1">
                <li>• MySQL / MariaDB</li>
                <li>• PostgreSQL</li>
                <li>• Oracle / SQL Server</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：选择正确的数据库方言可以获得更准确的格式化结果。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
