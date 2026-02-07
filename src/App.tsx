import './App.css';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useEffect } from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

function App() {
    const scrollToTop = useScrollToTop();

    // 在组件挂载时添加全局点击事件监听器
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // 检查点击的元素是否是可交互元素
            const isInteractiveElement =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('textarea') ||
                target.closest('select') ||
                target.closest('[role="button"]') ||
                target.closest('[tabindex]');

            // 如果点击的是交互元素，触发滚动到顶部
            if (isInteractiveElement) {
                // 使用 setTimeout 确保在其他事件处理完成后执行
                setTimeout(() => {
                    scrollToTop();
                }, 100);
            }
        };

        // 添加事件监听器
        document.addEventListener('click', handleClick, { passive: true });

        // 清理函数
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [scrollToTop]);

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
                <header aria-label="Site Header" className="shadow-sm">
                    <div className="container mx-auto p-4">
                        <div className="flex items-center justify-between">
                            <Link to="/">
                                <div className="flex items-center space-x-3">
                                    <img src="/logo.png" alt="橙子工具" className="w-10 h-10" />
                                    <h1 className="text-lg font-bold text-foreground">橙子工具</h1>
                                </div>
                            </Link>
                            <nav className="hidden md:flex items-center space-x-4">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/">
                                        <Icons.Home className="w-4 h-4 mr-2" />
                                        首页
                                    </Link>
                                </Button>
                            </nav>
                        </div>
                    </div>
                </header>
            </div>

            {/* Main Content */}
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-4 px-8 py-10 md:flex-row md:gap-2 md:px-0">
                        <p className="flex-auto text-center text-sm leading-loose md:text-left">
                            版权所有 © {new Date().getFullYear()} 橙子工具
                        </p>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <ScrollToTopButton />
        </>
    );
}

export default App;
