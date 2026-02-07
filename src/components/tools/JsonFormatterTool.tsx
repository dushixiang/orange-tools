import {useState, useCallback, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface JsonFormatterState {
    input: string;
    output: string;
    mode: 'format' | 'minify' | 'validate';
    error?: string;
    isValid?: boolean;
}

export function JsonFormatterTool() {
    const [state, setState] = useState<JsonFormatterState>({
        input: '',
        output: '',
        mode: 'format'
    });

    const [copySuccess, setCopySuccess] = useState<string>('');

    // JSON格式化函数
    const formatJson = useCallback((jsonString: string, indent: number = 2): string => {
        try {
            const parsed = JSON.parse(jsonString);
            return JSON.stringify(parsed, null, indent);
        } catch (error) {
            throw new Error('无效的JSON格式');
        }
    }, []);

    // JSON压缩函数
    const minifyJson = useCallback((jsonString: string): string => {
        try {
            const parsed = JSON.parse(jsonString);
            return JSON.stringify(parsed);
        } catch (error) {
            throw new Error('无效的JSON格式');
        }
    }, []);

    // JSON验证函数
    const validateJson = useCallback((jsonString: string): { isValid: boolean; message: string; details?: any } => {
        try {
            const parsed = JSON.parse(jsonString);

            // 统计信息
            const getJsonStats = (obj: any): any => {
                if (obj === null) return {type: 'null', value: null};
                if (typeof obj === 'boolean') return {type: 'boolean', value: obj};
                if (typeof obj === 'number') return {type: 'number', value: obj};
                if (typeof obj === 'string') return {type: 'string', length: obj.length};
                if (Array.isArray(obj)) {
                    return {
                        type: 'array',
                        length: obj.length,
                        elements: obj.length > 0 ? obj.map(getJsonStats) : []
                    };
                }
                if (typeof obj === 'object') {
                    const keys = Object.keys(obj);
                    return {
                        type: 'object',
                        keys: keys.length,
                        properties: keys.reduce((acc, key) => {
                            acc[key] = getJsonStats(obj[key]);
                            return acc;
                        }, {} as any)
                    };
                }
                return {type: typeof obj, value: obj};
            };

            const stats = getJsonStats(parsed);

            return {
                isValid: true,
                message: 'JSON格式正确',
                details: {
                    parsed,
                    stats,
                    size: jsonString.length,
                    minifiedSize: JSON.stringify(parsed).length
                }
            };
        } catch (error) {
            return {
                isValid: false,
                message: error instanceof Error ? error.message : '无效的JSON格式'
            };
        }
    }, []);

    // 处理转换
    const handleProcess = useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({...prev, output: '', error: undefined, isValid: undefined}));
            return;
        }

        try {
            let result: string;
            let isValid = true;

            switch (state.mode) {
                case 'format':
                    result = formatJson(state.input);
                    break;
                case 'minify':
                    result = minifyJson(state.input);
                    break;
                case 'validate':
                    const validation = validateJson(state.input);
                    isValid = validation.isValid;
                    result = validation.isValid
                        ? `✅ JSON格式正确\n\n统计信息:\n${JSON.stringify(validation.details?.stats, null, 2)}`
                        : `❌ ${validation.message}`;
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
    }, [state.input, state.mode, formatJson, minifyJson, validateJson]);

    // 实时处理
    useEffect(() => {
        const timer = setTimeout(() => {
            handleProcess();
        }, 300);

        return () => clearTimeout(timer);
    }, [handleProcess]);

    // 切换模式
    const setMode = (mode: 'format' | 'minify' | 'validate') => {
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
        const example = `{
  "name": "张三",
  "age": 30,
  "city": "北京",
  "hobbies": ["阅读", "旅行", "编程"],
  "address": {
    "street": "中关村大街",
    "number": 123,
    "zipCode": "100080"
  },
  "isActive": true,
  "balance": 1234.56,
  "lastLogin": null
}`;

        setState(prev => ({
            ...prev,
            input: example,
            error: undefined,
            isValid: undefined
        }));
    };

    const getModeDescription = () => {
        switch (state.mode) {
            case 'format':
                return '格式化JSON，使其更易读';
            case 'minify':
                return '压缩JSON，移除空白字符';
            case 'validate':
                return '验证JSON格式并显示统计信息';
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
                                <Icons.Braces className="w-6 h-6 text-primary"/>
                            </div>
                            <div>
                                <CardTitle className="text-2xl">JSON 格式化工具</CardTitle>
                                <CardDescription className="mt-1">
                                    {getModeDescription()}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={state.mode === 'format' ? 'default' : 'secondary'} className="text-sm">
                                格式化
                            </Badge>
                            <Badge variant={state.mode === 'minify' ? 'default' : 'secondary'} className="text-sm">
                                压缩
                            </Badge>
                            <Badge variant={state.mode === 'validate' ? 'default' : 'secondary'} className="text-sm">
                                验证
                            </Badge>
                        </div>
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
                            <Icons.AlignLeft className="w-4 h-4 mr-2"/>
                            格式化
                        </Button>
                        <Button
                            onClick={() => setMode('minify')}
                            variant={state.mode === 'minify' ? 'default' : 'outline'}
                        >
                            <Icons.Minimize2 className="w-4 h-4 mr-2"/>
                            压缩
                        </Button>
                        <Button
                            onClick={() => setMode('validate')}
                            variant={state.mode === 'validate' ? 'default' : 'outline'}
                        >
                            <Icons.CheckCircle className="w-4 h-4 mr-2"/>
                            验证
                        </Button>
                        <Button onClick={loadExample} variant="outline">
                            <Icons.FileText className="w-4 h-4 mr-2"/>
                            加载示例
                        </Button>
                        <Button onClick={clearAll} variant="outline">
                            <Icons.Trash2 className="w-4 h-4 mr-2"/>
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
                            <CardTitle className="text-lg">JSON 输入</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(state.input, 'input')}
                                    disabled={!state.input}
                                >
                                    {copySuccess === 'input' ? (
                                        <Icons.Check className="w-4 h-4"/>
                                    ) : (
                                        <Icons.Copy className="w-4 h-4"/>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入JSON数据..."
                            value={state.input}
                            onChange={(e) => setState(prev => ({...prev, input: e.target.value}))}
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
                                {state.mode === 'format' && '格式化结果'}
                                {state.mode === 'minify' && '压缩结果'}
                                {state.mode === 'validate' && '验证结果'}
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
                                        <Icons.Check className="w-4 h-4"/>
                                    ) : (
                                        <Icons.Copy className="w-4 h-4"/>
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
                                    <Icons.AlertCircle className="w-3 h-3 mr-1"/>
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
                        <Icons.Info className="w-5 h-5 mr-2"/>
                        使用说明
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                            <h4 className="font-medium text-foreground mb-2">格式化模式</h4>
                            <ul className="space-y-1">
                                <li>• 美化JSON结构，增加缩进</li>
                                <li>• 提高可读性</li>
                                <li>• 便于调试和查看</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">压缩模式</h4>
                            <ul className="space-y-1">
                                <li>• 移除所有空白字符</li>
                                <li>• 减小文件大小</li>
                                <li>• 适合生产环境</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">验证模式</h4>
                            <ul className="space-y-1">
                                <li>• 检查JSON语法正确性</li>
                                <li>• 显示详细统计信息</li>
                                <li>• 提供错误诊断</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 提示：支持复杂的嵌套结构，包括对象、数组、字符串、数字、布尔值和null值。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
