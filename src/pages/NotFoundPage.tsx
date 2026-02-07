import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md text-center border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                            <Icons.AlertTriangle className="w-16 h-16 text-orange-500" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground mb-2">
                        404
                    </CardTitle>
                    <CardDescription className="text-lg">
                        页面未找到
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        抱歉，您访问的页面不存在或已被移动。
                        <br />
                        请检查网址是否正确，或返回首页继续浏览。
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild className="bg-primary hover:bg-primary/90">
                            <Link to="/">
                                <Icons.Home className="w-4 h-4 mr-2" />
                                返回首页
                            </Link>
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={handleGoBack}
                            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                            返回上页
                        </Button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-muted-foreground mb-3">
                            您可能在寻找这些工具：
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/base64">
                                    <Icons.Code className="w-3 h-3 mr-1" />
                                    Base64
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/json-formatter">
                                    <Icons.Braces className="w-3 h-3 mr-1" />
                                    JSON格式化
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/qr-code-generator">
                                    <Icons.QrCode className="w-3 h-3 mr-1" />
                                    二维码生成
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}