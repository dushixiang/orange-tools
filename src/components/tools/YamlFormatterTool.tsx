import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface YamlFormatterState {
  input: string;
  output: string;
  mode: 'format' | 'validate' | 'json-to-yaml' | 'yaml-to-json';
  error?: string;
  isValid?: boolean;
}

export function YamlFormatterTool() {
  const [state, setState] = useState<YamlFormatterState>({
    input: '',
    output: '',
    mode: 'format'
  });

  const [copySuccess, setCopySuccess] = useState<string>('');

  // 简单的YAML格式化函数
  const formatYaml = useCallback((yamlString: string): string => {
    try {
      if (!yamlString.trim()) return '';
      
      const lines = yamlString.split('\n');
      const formatted: string[] = [];
      let indentLevel = 0;
      
      for (let line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          formatted.push(line);
          continue;
        }
        
        // 处理数组项
        if (trimmed.startsWith('- ')) {
          formatted.push('  '.repeat(indentLevel) + trimmed);
          continue;
        }
        
        // 处理键值对
        if (trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':').trim();
          
          if (value === '' || value === '|' || value === '>') {
            // 多行值或空值
            formatted.push('  '.repeat(indentLevel) + key.trim() + ':' + (value ? ' ' + value : ''));
            if (value === '|' || value === '>') {
              indentLevel++;
            }
          } else {
            formatted.push('  '.repeat(indentLevel) + key.trim() + ': ' + value);
          }
          continue;
        }
        
        formatted.push('  '.repeat(indentLevel) + trimmed);
      }
      
      return formatted.join('\n');
    } catch (error) {
      throw new Error('YAML格式化失败');
    }
  }, []);

  // JSON转YAML
  const jsonToYaml = useCallback((jsonString: string): string => {
    try {
      const obj = JSON.parse(jsonString);
      return convertObjectToYaml(obj, 0);
    } catch (error) {
      throw new Error('JSON格式错误，无法转换为YAML');
    }
  }, []);

  // 对象转YAML的递归函数
  const convertObjectToYaml = (obj: any, indent: number): string => {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'string') {
      // 如果字符串包含特殊字符，需要引号
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        const yamlItem = convertObjectToYaml(item, indent + 1);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return `${spaces}- ${yamlItem.split('\n').map((line, i) => i === 0 ? line : `${spaces}  ${line}`).join('\n')}`;
        }
        return `${spaces}- ${yamlItem}`;
      }).join('\n');
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      
      return keys.map(key => {
        const value = obj[key];
        const yamlValue = convertObjectToYaml(value, indent + 1);
        
        if (typeof value === 'object' && value !== null) {
          return `${spaces}${key}:\n${yamlValue}`;
        }
        return `${spaces}${key}: ${yamlValue}`;
      }).join('\n');
    }
    
    return String(obj);
  };

  // YAML转JSON（简单实现）
  const yamlToJson = useCallback((yamlString: string): string => {
    try {
      // 这是一个简化的YAML解析器，只处理基本情况
      const lines = yamlString.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      const result = parseYamlLines(lines);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error('YAML格式错误，无法转换为JSON');
    }
  }, []);

  // 简单的YAML解析函数
  const parseYamlLines = (lines: string[]): any => {
    const result: any = {};
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        
        if (value) {
          // 尝试解析值
          if (value === 'true' || value === 'false') {
            result[key.trim()] = value === 'true';
          } else if (!isNaN(Number(value))) {
            result[key.trim()] = Number(value);
          } else if (value.startsWith('"') && value.endsWith('"')) {
            result[key.trim()] = value.slice(1, -1);
          } else {
            result[key.trim()] = value;
          }
        } else {
          result[key.trim()] = {};
        }
      }
    }
    
    return result;
  };

  // 验证YAML
  const validateYaml = useCallback((yamlString: string): { isValid: boolean; message: string } => {
    try {
      if (!yamlString.trim()) {
        return { isValid: false, message: 'YAML内容为空' };
      }
      
      // 基本的YAML语法检查
      const lines = yamlString.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        // 检查缩进是否为偶数空格
        const indent = line.length - line.trimStart().length;
        if (indent % 2 !== 0) {
          return { isValid: false, message: `第${i + 1}行: 缩进应为偶数个空格` };
        }
        
        // 检查键值对格式
        if (trimmed.includes(':') && !trimmed.startsWith('- ')) {
          const colonIndex = trimmed.indexOf(':');
          const afterColon = trimmed.substring(colonIndex + 1).trim();
          if (afterColon && !afterColon.startsWith(' ') && afterColon !== '|' && afterColon !== '>') {
            // 这个检查可能过于严格，暂时注释
            // return { isValid: false, message: `第${i + 1}行: 冒号后应有空格` };
          }
        }
      }
      
      return { isValid: true, message: 'YAML格式正确' };
    } catch (error) {
      return { isValid: false, message: '无效的YAML格式' };
    }
  }, []);

  // 处理转换
  const handleProcess = useCallback(() => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, output: '', error: undefined, isValid: undefined }));
      return;
    }

    try {
      let result: string;
      let isValid = true;
      
      switch (state.mode) {
        case 'format':
          result = formatYaml(state.input);
          break;
        case 'validate':
          const validation = validateYaml(state.input);
          isValid = validation.isValid;
          result = validation.isValid ? '✅ YAML格式正确' : `❌ ${validation.message}`;
          break;
        case 'json-to-yaml':
          result = jsonToYaml(state.input);
          break;
        case 'yaml-to-json':
          result = yamlToJson(state.input);
          break;
        default:
          result = state.input;
      }
      
      setState(prev => ({ 
        ...prev, 
        output: result, 
        error: undefined,
        isValid 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        output: '', 
        error: error instanceof Error ? error.message : '处理失败',
        isValid: false
      }));
    }
  }, [state.input, state.mode, formatYaml, validateYaml, jsonToYaml, yamlToJson]);

  // 实时处理
  useEffect(() => {
    const timer = setTimeout(() => {
      handleProcess();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleProcess]);

  // 设置模式
  const setMode = (mode: 'format' | 'validate' | 'json-to-yaml' | 'yaml-to-json') => {
    setState(prev => ({
      ...prev,
      mode,
      output: '',
      error: undefined,
      isValid: undefined
    }));
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: 'input' | 'output') => {
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
      input: '',
      output: '',
      mode: prev.mode,
      error: undefined,
      isValid: undefined
    }));
  };

  // 示例数据
  const loadExample = () => {
    const examples = {
      format: `name: 张三
age: 30
city: 北京
hobbies:
  - 阅读
  - 旅行
  - 编程
address:
  street: 中关村大街
  number: 123
  zipCode: "100080"
isActive: true
balance: 1234.56`,
      validate: `name: 张三
age: 30
hobbies:
- 阅读
- 旅行`,
      'json-to-yaml': `{
  "name": "张三",
  "age": 30,
  "hobbies": ["阅读", "旅行"],
  "address": {
    "city": "北京"
  }
}`,
      'yaml-to-json': `name: 张三
age: 30
hobbies:
  - 阅读
  - 旅行`
    };
    
    setState(prev => ({
      ...prev,
      input: examples[prev.mode],
      error: undefined,
      isValid: undefined
    }));
  };

  const getModeDescription = () => {
    switch (state.mode) {
      case 'format':
        return '格式化YAML，规范缩进和结构';
      case 'validate':
        return '验证YAML语法正确性';
      case 'json-to-yaml':
        return '将JSON转换为YAML格式';
      case 'yaml-to-json':
        return '将YAML转换为JSON格式';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">YAML 格式化工具</CardTitle>
                <CardDescription className="mt-1">
                  {getModeDescription()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {state.mode.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮区域 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setMode('format')} 
              variant={state.mode === 'format' ? 'default' : 'outline'}
            >
              <Icons.AlignLeft className="w-4 h-4 mr-2" />
              格式化
            </Button>
            <Button 
              onClick={() => setMode('validate')} 
              variant={state.mode === 'validate' ? 'default' : 'outline'}
            >
              <Icons.CheckCircle className="w-4 h-4 mr-2" />
              验证
            </Button>
            <Button 
              onClick={() => setMode('json-to-yaml')} 
              variant={state.mode === 'json-to-yaml' ? 'default' : 'outline'}
            >
              <Icons.ArrowRight className="w-4 h-4 mr-2" />
              JSON→YAML
            </Button>
            <Button 
              onClick={() => setMode('yaml-to-json')} 
              variant={state.mode === 'yaml-to-json' ? 'default' : 'outline'}
            >
              <Icons.ArrowLeft className="w-4 h-4 mr-2" />
              YAML→JSON
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
                {state.mode === 'json-to-yaml' ? 'JSON 输入' : 'YAML 输入'}
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
              placeholder={state.mode === 'json-to-yaml' ? '请输入JSON数据...' : '请输入YAML数据...'}
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {state.input.length}
              {state.input && (
                <span className="ml-4">
                  行数: {state.input.split('\n').length}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {state.mode === 'format' && 'YAML 格式化结果'}
                {state.mode === 'validate' && '验证结果'}
                {state.mode === 'json-to-yaml' && 'YAML 输出'}
                {state.mode === 'yaml-to-json' && 'JSON 输出'}
              </CardTitle>
              <div className="flex gap-2">
                {state.isValid !== undefined && (
                  <Badge variant={state.isValid ? 'default' : 'destructive'} className="text-xs">
                    {state.isValid ? '有效' : '无效'}
                  </Badge>
                )}
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
              placeholder="处理结果将显示在这里..."
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
                    字符数: {state.output.length}
                    <span className="ml-4">
                      行数: {state.output.split('\n').length}
                    </span>
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
              <h4 className="font-medium text-foreground mb-2">YAML特点</h4>
              <ul className="space-y-1">
                <li>• 使用缩进表示层级关系</li>
                <li>• 缩进必须使用空格，不能使用Tab</li>
                <li>• 大小写敏感</li>
                <li>• 支持注释（以#开头）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">应用场景</h4>
              <ul className="space-y-1">
                <li>• 配置文件（Docker Compose、Kubernetes）</li>
                <li>• CI/CD配置（GitHub Actions、GitLab CI）</li>
                <li>• 数据序列化和交换</li>
                <li>• API文档（OpenAPI/Swagger）</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：YAML是JSON的超集，更适合人类阅读和编写，广泛用于配置文件。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
