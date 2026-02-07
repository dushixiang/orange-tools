import {useState, useCallback, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface UnicodeToolState {
    input: string;
    output: string;
    mode: 'encode' | 'decode';
    format: 'unicode' | 'hex' | 'decimal' | 'html';
    error?: string;
}

export function UnicodeTool() {
    const [state, setState] = useState<UnicodeToolState>({
        input: '',
        output: '',
        mode: 'encode',
        format: 'unicode'
    });

    const [copySuccess, setCopySuccess] = useState<string>('');

    // Unicode编码函数
    const encodeUnicode = useCallback((text: string, format: string): string => {
        try {
            if (!text) return '';

            let result = '';
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const codePoint = char.codePointAt(0) || 0;

                switch (format) {
                    case 'unicode':
                        result += `\\u${codePoint.toString(16).padStart(4, '0').toUpperCase()}`;
                        break;
                    case 'hex':
                        result += `0x${codePoint.toString(16).toUpperCase()} `;
                        break;
                    case 'decimal':
                        result += `${codePoint} `;
                        break;
                    case 'html':
                        result += `&#${codePoint};`;
                        break;
                    default:
                        result += char;
                }
            }

            return result.trim();
        } catch (error) {
            throw new Error('编码失败：输入包含无效字符');
        }
    }, []);

    // Unicode解码函数
    const decodeUnicode = useCallback((text: string, format: string): string => {
        try {
            if (!text) return '';

            let result = '';

            switch (format) {
                case 'unicode':
                    // 处理 \uXXXX 格式
                    result = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
                        return String.fromCharCode(parseInt(hex, 16));
                    });
                    break;

                case 'hex':
                    // 处理 0xXX 或 XX 格式
                    const hexMatches = text.match(/(0x)?([0-9a-fA-F]+)/g);
                    if (hexMatches) {
                        hexMatches.forEach(hex => {
                            const cleanHex = hex.replace('0x', '');
                            const codePoint = parseInt(cleanHex, 16);
                            if (!isNaN(codePoint)) {
                                result += String.fromCodePoint(codePoint);
                            }
                        });
                    }
                    break;

                case 'decimal':
                    // 处理十进制数字
                    const decMatches = text.match(/\d+/g);
                    if (decMatches) {
                        decMatches.forEach(dec => {
                            const codePoint = parseInt(dec, 10);
                            if (!isNaN(codePoint)) {
                                result += String.fromCodePoint(codePoint);
                            }
                        });
                    }
                    break;

                case 'html':
                    // 处理 &#XXXX; 格式
                    result = text.replace(/&#(\d+);/g, (_, dec) => {
                        return String.fromCharCode(parseInt(dec, 10));
                    });
                    // 处理 &#xXXXX; 格式
                    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
                        return String.fromCharCode(parseInt(hex, 16));
                    });
                    break;

                default:
                    result = text;
            }

            return result;
        } catch (error) {
            throw new Error('解码失败：' + (error instanceof Error ? error.message : '无效的编码格式'));
        }
    }, []);

    // 处理转换
    const handleConvert = useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({...prev, output: '', error: undefined}));
            return;
        }

        try {
            let result: string;
            if (state.mode === 'encode') {
                result = encodeUnicode(state.input, state.format);
            } else {
                result = decodeUnicode(state.input, state.format);
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
    }, [state.input, state.mode, state.format, encodeUnicode, decodeUnicode]);

    // 实时转换
    useEffect(() => {
        const timer = setTimeout(() => {
            handleConvert();
        }, 300);

        return () => clearTimeout(timer);
    }, [handleConvert]);

    // 切换模式
    const toggleMode = () => {
        setState(prev => {
            const newMode = prev.mode === 'encode' ? 'decode' : 'encode';
            return {
                ...prev,
                mode: newMode,
                input: prev.output || prev.input,
                output: '',
                error: undefined
            };
        });
    };

    // 设置格式
    const setFormat = (format: 'unicode' | 'hex' | 'decimal' | 'html') => {
        setState(prev => ({
            ...prev,
            format,
            output: '',
            error: undefined
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
            format: prev.format,
            error: undefined
        }));
    };

    // 示例数据
    const loadExample = () => {
        const examples = {
            encode: {
                unicode: 'Hello, 世界! 🌍 Unicode示例',
                hex: 'Hello, 世界! 🌍 Unicode示例',
                decimal: 'Hello, 世界! 🌍 Unicode示例',
                html: 'Hello, 世界! 🌍 Unicode示例'
            },
            decode: {
                unicode: '\\u0048\\u0065\\u006C\\u006C\\u006F\\u002C\\u0020\\u4E16\\u754C\\u0021',
                hex: '0x48 0x65 0x6C 0x6C 0x6F 0x2C 0x20 0x4E16 0x754C 0x21',
                decimal: '72 101 108 108 111 44 32 19990 30028 33',
                html: '&#72;&#101;&#108;&#108;&#111;&#44;&#32;&#19990;&#30028;&#33;'
            }
        };

        setState(prev => ({
            ...prev,
            input: examples[prev.mode][prev.format],
            error: undefined
        }));
    };

    const getFormatDescription = () => {
        switch (state.format) {
            case 'unicode':
                return 'Unicode转义序列 (\\uXXXX)';
            case 'hex':
                return '十六进制编码 (0xXX)';
            case 'decimal':
                return '十进制编码';
            case 'html':
                return 'HTML实体编码 (&#XXXX;)';
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
                                <Icons.Type className="w-6 h-6 text-primary"/>
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Unicode 编码/解码工具</CardTitle>
                                <CardDescription className="mt-1">
                                    {getFormatDescription()} - {state.mode === 'encode' ? '编码' : '解码'}模式
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={state.mode === 'encode' ? 'default' : 'secondary'} className="text-sm">
                                {state.mode === 'encode' ? '编码模式' : '解码模式'}
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                                {state.format.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* 操作按钮区域 */}
            <Card>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={toggleMode} variant="outline">
                                <Icons.RefreshCw className="w-4 h-4 mr-2"/>
                                切换到{state.mode === 'encode' ? '解码' : '编码'}模式
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

                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-muted-foreground">编码格式:</span>
                            <Button
                                size="sm"
                                onClick={() => setFormat('unicode')}
                                variant={state.format === 'unicode' ? 'default' : 'outline'}
                            >
                                Unicode
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setFormat('hex')}
                                variant={state.format === 'hex' ? 'default' : 'outline'}
                            >
                                十六进制
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setFormat('decimal')}
                                variant={state.format === 'decimal' ? 'default' : 'outline'}
                            >
                                十进制
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setFormat('html')}
                                variant={state.format === 'html' ? 'default' : 'outline'}
                            >
                                HTML实体
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
                            <CardTitle className="text-lg">
                                {state.mode === 'encode' ? '原始文本' : '编码文本'}
                            </CardTitle>
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
                            placeholder={state.mode === 'encode'
                                ? '请输入要编码的文本...'
                                : '请输入要解码的编码文本...'
                            }
                            value={state.input}
                            onChange={(e) => setState(prev => ({...prev, input: e.target.value}))}
                            className="min-h-[200px] font-mono text-sm"
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                            字符数: {state.input.length}
                            {state.mode === 'encode' && state.input && (
                                <span className="ml-4">
                  字节数: {new TextEncoder().encode(state.input).length}
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
                                {state.mode === 'encode' ? '编码结果' : '解码结果'}
                            </CardTitle>
                            <div className="flex gap-2">
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
                            placeholder="转换结果将显示在这里..."
                            value={state.output}
                            readOnly
                            className={`min-h-[200px] font-mono text-sm ${
                                state.error ? 'border-destructive' : ''
                            }`}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                                {state.output && (
                                    <>
                                        字符数: {state.output.length}
                                        {state.mode === 'decode' && (
                                            <span className="ml-4">
                        字节数: {new TextEncoder().encode(state.output).length}
                      </span>
                                        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                            <h4 className="font-medium text-foreground mb-2">编码格式说明</h4>
                            <ul className="space-y-1">
                                <li>• <strong>Unicode:</strong> \\u0048 格式，常用于JavaScript</li>
                                <li>• <strong>十六进制:</strong> 0x48 格式，程序员友好</li>
                                <li>• <strong>十进制:</strong> 72 格式，直接的数值表示</li>
                                <li>• <strong>HTML实体:</strong> &#72; 格式，用于网页显示</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">应用场景</h4>
                            <ul className="space-y-1">
                                <li>• 网页特殊字符显示</li>
                                <li>• 程序代码中的字符转义</li>
                                <li>• 数据传输编码</li>
                                <li>• 字符集转换调试</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 提示：支持所有Unicode字符，包括中文、日文、韩文、表情符号等。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
