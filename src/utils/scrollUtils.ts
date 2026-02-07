/**
 * 滚动相关的工具函数
 */

/**
 * 检查浏览器是否支持原生平滑滚动
 */
export function supportsNativeSmoothScroll(): boolean {
  return 'scrollBehavior' in document.documentElement.style;
}

/**
 * 获取当前滚动位置
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
}

/**
 * 检查元素是否在视口中
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 平滑滚动到指定位置
 */
export function smoothScrollTo(
  targetX: number = 0, 
  targetY: number = 0, 
  duration: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    if (supportsNativeSmoothScroll()) {
      window.scrollTo({
        top: targetY,
        left: targetX,
        behavior: 'smooth'
      });
      
      // 估算滚动完成时间
      setTimeout(resolve, duration);
    } else {
      // JavaScript 回退方案
      const startPosition = getScrollPosition();
      const startTime = performance.now();
      
      const deltaX = targetX - startPosition.x;
      const deltaY = targetY - startPosition.y;

      // 缓动函数：ease-out-cubic
      const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3);
      };

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easeOutCubic(progress);
        const currentX = startPosition.x + deltaX * easedProgress;
        const currentY = startPosition.y + deltaY * easedProgress;
        
        window.scrollTo(currentX, currentY);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animateScroll);
    }
  });
}

/**
 * 平滑滚动到指定元素
 */
export function smoothScrollToElement(
  element: HTMLElement, 
  offset: number = 0,
  duration: number = 500
): Promise<void> {
  const rect = element.getBoundingClientRect();
  const targetY = window.pageYOffset + rect.top - offset;
  
  return smoothScrollTo(0, targetY, duration);
}

/**
 * 节流函数 - 用于优化滚动事件处理
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}