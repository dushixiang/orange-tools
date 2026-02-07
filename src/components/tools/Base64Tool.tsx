import {useState, useCallback, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Badge} from '@/components/ui/badge';
import type {Base64ToolState} from '@/types/tool';
import * as Icons from 'lucide-react';

export function Base64Tool() {
    const [state, setState] = useState<Base64ToolState>({
        input: '',
        output: '',
        mode: 'encode'
    });

    const [copySuccess, setCopySuccess] = useState<string>('');

    // Base64编码函数
    const encodeBase64 = useCallback((text: string): string => {
        try {
            // 处理Unicode字符
            const utf8Bytes = new TextEncoder().encode(text);
            const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
            return btoa(binaryString);
        } catch (error) {
            throw new Error('编码失败：输入包含无效字符');
        }
    }, []);

    // Base64解码函数
    const decodeBase64 = useCallback((base64: string): string => {
        try {
            // 清理Base64字符串（移除空白字符）
            const cleanBase64 = base64.replace(/\s/g, '');

            // 验证Base64格式
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
                throw new Error('无效的Base64格式');
            }

            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            return new TextDecoder().decode(bytes);
        } catch (error) {
            throw new Error('解码失败：' + (error instanceof Error ? error.message : '无效的Base64字符串'));
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
                result = encodeBase64(state.input);
            } else {
                result = decodeBase64(state.input);
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
    }, [state.input, state.mode, encodeBase64, decodeBase64]);

    // 实时转换
    useEffect(() => {
        const timer = setTimeout(() => {
            handleConvert();
        }, 300); // 防抖处理

        return () => clearTimeout(timer);
    }, [handleConvert]);

    // 切换模式
    const toggleMode = () => {
        setState(prev => {
            const newMode = prev.mode === 'encode' ? 'decode' : 'encode';
            return {
                mode: newMode,
                input: prev.output || prev.input, // 如果有输出结果，将其作为新的输入
                output: '',
                error: undefined
            };
        });
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
        setState({
            input: '',
            output: '',
            mode: state.mode,
            error: undefined
        });
    };

    // 示例数据
    const loadExample = () => {
        const examples = {
            encode: 'Hello, 世界! 这是一个Base64编码示例。',
            decode: 'SGVsbG8sIOS4lueVjCEg6L+Z5piv5LiA5LiqQmFzZTY057yW56CB56S65L6L44CC'
        };

        setState(prev => ({
            ...prev,
            input: examples[prev.mode],
            error: undefined
        }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 工具标题和描述 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Icons.Binary className="w-6 h-6 text-primary"/>
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Base64 编码/解码工具</CardTitle>
                                <CardDescription className="mt-1">
                                    支持文本的Base64编码和解码，自动处理Unicode字符，实时转换
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant={state.mode === 'encode' ? 'default' : 'secondary'} className="text-sm">
                            {state.mode === 'encode' ? '编码模式' : '解码模式'}
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* 操作按钮区域 */}
            <Card>
                <CardContent className="">
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
                </CardContent>
            </Card>

            {/* 主要工作区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 输入区域 */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                {state.mode === 'encode' ? '原始文本' : 'Base64字符串'}
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
                                : '请输入要解码的Base64字符串...'
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
                                {state.mode === 'encode' ? 'Base64结果' : '解码结果'}
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
                            <h4 className="font-medium text-foreground mb-2">编码模式</h4>
                            <ul className="space-y-1">
                                <li>• 将普通文本转换为Base64编码</li>
                                <li>• 支持中文和特殊字符</li>
                                <li>• 自动处理UTF-8编码</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">解码模式</h4>
                            <ul className="space-y-1">
                                <li>• 将Base64字符串还原为原始文本</li>
                                <li>• 自动验证Base64格式</li>
                                <li>• 支持带换行的Base64字符串</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 提示：所有转换都在浏览器本地完成，不会上传到服务器，保护您的数据隐私安全。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
