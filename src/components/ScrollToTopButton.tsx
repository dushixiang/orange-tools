import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { throttle } from '@/utils/scrollUtils';

interface ScrollToTopButtonProps {
  showAfter?: number; // 滚动多少像素后显示按钮
  className?: string;
}

export function ScrollToTopButton({ showAfter = 300, className = '' }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > showAfter);
    }, 100);

    // 添加滚动事件监听器
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始检查
    handleScroll();

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfter]);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className={`fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 animate-in fade-in slide-in-from-bottom-2 ${className}`}
      aria-label="滚动到顶部"
    >
      <Icons.ArrowUp className="w-5 h-5" />
    </Button>
  );
}