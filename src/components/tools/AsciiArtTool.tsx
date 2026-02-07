import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import * as Icons from 'lucide-react';
import figlet from 'figlet';

export function AsciiArtTool() {
    const [text, setText] = useState('Hello!');
    const [font, setFont] = useState('Standard');
    const [asciiArt, setAsciiArt] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const fonts = ['Standard'];

    // 动态加载字体
    useEffect(() => {
        // 直接设置字体已加载，使用figlet的默认字体
        setFontsLoaded(true);
    }, []);

    const generateAsciiArt = () => {
        if (!text.trim() || !fontsLoaded) {
            setAsciiArt('');
            return;
        }

        try {
            figlet.text(
                text,
                {
                    font: font as any,
                    horizontalLayout: 'default',
                    verticalLayout: 'default',
                },
                (err, result) => {
                    if (err) {
                        console.error('生成 ASCII 艺术失败:', err);
                        return;
                    }
                    setAsciiArt(result || '');
                }
            );
        } catch (error) {
            console.error('生成 ASCII 艺术失败:', error);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(asciiArt);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('复制失败:', error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Icons.Type className="w-6 h-6 text-primary"/>
                        </div>
                        <div>
                            <CardTitle className="text-2xl">ASCII 艺术生成器</CardTitle>
                            <CardDescription className="mt-1">
                                将文本转换为字符艺术，适用于代码注释、终端显示等
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 控制面板 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">输入设置</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">文本内容</label>
                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="输入要转换的文本..."
                                maxLength={20}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                建议不超过 20 个字符
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">字体样式</label>
                            <select
                                value={font}
                                onChange={(e) => setFont(e.target.value)}
                                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                            >
                                {fonts.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button onClick={generateAsciiArt} className="w-full">
                            <Icons.Wand2 className="w-4 h-4 mr-2"/>
                            生成 ASCII 艺术
                        </Button>
                    </CardContent>
                </Card>

                {/* 预览区域 */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">ASCII 艺术预览</CardTitle>
                                {asciiArt && (
                                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                                        {copySuccess ? (
                                            <Icons.Check className="w-4 h-4 mr-2"/>
                                        ) : (
                                            <Icons.Copy className="w-4 h-4 mr-2"/>
                                        )}
                                        复制
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {asciiArt ? (
                                <pre
                                    className="bg-muted/30 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-tight">
                  {asciiArt}
                </pre>
                            ) : (
                                <div className="text-center py-20 text-muted-foreground">
                                    <Icons.FileText className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                    <p>输入文本并点击生成按钮</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 快捷选项 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">快捷示例</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setText('HELLO');
                                        setFont('Standard');
                                    }}
                                >
                                    <Icons.Home className="w-3 h-3 mr-1"/>
                                    默认样式
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setText('CODE');
                                        setFont('Slant');
                                    }}
                                >
                                    <Icons.Code className="w-3 h-3 mr-1"/>
                                    代码注释
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setText('ERROR');
                                        setFont('Banner');
                                    }}
                                >
                                    <Icons.AlertTriangle className="w-3 h-3 mr-1"/>
                                    错误提示
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setText('DONE');
                                        setFont('Block');
                                    }}
                                >
                                    <Icons.CheckCircle className="w-3 h-3 mr-1"/>
                                    完成标记
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 使用说明 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Icons.Info className="w-5 h-5 mr-2"/>
                        使用场景
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                            <h4 className="font-medium text-foreground mb-2">代码注释</h4>
                            <ul className="space-y-1">
                                <li>• 美化文件头部注释</li>
                                <li>• 区分代码区域</li>
                                <li>• 提高代码可读性</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">终端显示</h4>
                            <ul className="space-y-1">
                                <li>• CLI 工具欢迎界面</li>
                                <li>• 进度指示器</li>
                                <li>• 错误信息展示</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground mb-2">其他用途</h4>
                            <ul className="space-y-1">
                                <li>• README 文档美化</li>
                                <li>• 社交媒体帖子</li>
                                <li>• 个性签名</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 提示：不同字体适用于不同场景，Standard 和 Slant 最常用于代码注释。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
