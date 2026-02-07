import { useCallback } from 'react';
import { smoothScrollTo } from '@/utils/scrollUtils';

/**
 * 滚动到顶部的自定义 Hook
 * 优先使用 CSS scroll-behavior: smooth，不支持时使用 JavaScript 回退方案
 */
export function useScrollToTop() {
  const scrollToTop = useCallback(() => {
    smoothScrollTo(0, 0, 500);
  }, []);

  return scrollToTop;
}