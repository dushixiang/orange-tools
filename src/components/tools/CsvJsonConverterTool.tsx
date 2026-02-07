import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import Papa from 'papaparse';

interface CsvJsonState {
  input: string;
  output: string;
  mode: 'csvToJson' | 'jsonToCsv';
  error?: string;
}

export function CsvJsonConverterTool() {
  const [state, setState] = useState<CsvJsonState>({
    input: '',
    output: '',
    mode: 'csvToJson'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  const convertCsvToJson = useCallback((csv: string): string => {
    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return JSON.stringify(result.data, null, 2);
  }, []);

  const convertJsonToCsv = useCallback((json: string): string => {
    const data = JSON.parse(json);
    const arrayData = Array.isArray(data) ? data : [data];

    const csv = Papa.unparse(arrayData, {
      quotes: true,
      header: true
    });

    return csv;
  }, []);

  const handleConvert = useCallback(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, output: '', error: undefined }));
      return;
    }

    try {
      let result: string;
      if (state.mode === 'csvToJson') {
        result = convertCsvToJson(state.input);
      } else {
        result = convertJsonToCsv(state.input);
      }

      setState(prev => ({
        ...prev,
        output: result,
        error: undefined
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        output: '',
        error: error instanceof Error ? error.message : '转换失败'
      }));
    }
  }, [state.input, state.mode, convertCsvToJson, convertJsonToCsv]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleConvert();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleConvert]);

  const toggleMode = () => {
    setState(prev => {
      const newMode = prev.mode === 'csvToJson' ? 'jsonToCsv' : 'csvToJson';
      return {
        mode: newMode,
        input: prev.output || prev.input,
        output: '',
        error: undefined
      };
    });
  };

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
    const examples = {
      csvToJson: `name,age,city,email
张三,28,北京,zhangsan@example.com
李四,32,上海,lisi@example.com
王五,25,广州,wangwu@example.com`,
      jsonToCsv: `[
  {
    "name": "张三",
    "age": 28,
    "city": "北京",
    "email": "zhangsan@example.com"
  },
  {
    "name": "李四",
    "age": 32,
    "city": "上海",
    "email": "lisi@example.com"
  }
]`
    };
    setState(prev => ({ ...prev, input: examples[prev.mode], error: undefined }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Table className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">CSV/JSON 互转工具</CardTitle>
                <CardDescription className="mt-1">
                  CSV 与 JSON 格式互相转换，支持批量数据处理
                </CardDescription>
              </div>
            </div>
            <Badge variant={state.mode === 'csvToJson' ? 'default' : 'secondary'} className="text-sm">
              {state.mode === 'csvToJson' ? 'CSV → JSON' : 'JSON → CSV'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={toggleMode} variant="outline">
              <Icons.RefreshCw className="w-4 h-4 mr-2" />
              切换到{state.mode === 'csvToJson' ? 'JSON → CSV' : 'CSV → JSON'}
            </Button>
            <Button onClick={loadExample} variant="outline">
              <Icons.FileText className="w-4 h-4 mr-2" />
              加载示例
            </Button>
            <Button onClick={clearAll} variant="outline">
              <Icons.Trash2 className="w-4 h-4 mr-2" />
              清空内容
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 主要工作区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'csvToJson' ? 'CSV 数据' : 'JSON 数据'}
              </CardTitle>
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
              placeholder={state.mode === 'csvToJson'
                ? '粘贴 CSV 数据...\n例如：\nname,age,city\n张三,28,北京'
                : '粘贴 JSON 数组...\n例如：\n[{"name":"张三","age":28}]'
              }
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
              <CardTitle className="text-lg">
                {state.mode === 'csvToJson' ? 'JSON 结果' : 'CSV 结果'}
              </CardTitle>
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
              placeholder="转换结果将显示在这里..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">CSV → JSON</h4>
              <ul className="space-y-1">
                <li>• 第一行作为字段名</li>
                <li>• 自动检测数据类型</li>
                <li>• 支持多行数据</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">JSON → CSV</h4>
              <ul className="space-y-1">
                <li>• 支持对象数组</li>
                <li>• 自动生成表头</li>
                <li>• 字段值自动引号包裹</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：CSV 数据应包含表头行，JSON 数据应为数组格式以便正确转换。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
