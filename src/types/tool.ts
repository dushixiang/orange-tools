// 工具类型定义
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  path: string;
}

// 工具分类
export const ToolCategory = {
  ENCODING: 'encoding',
  TEXT: 'text',
  CRYPTO: 'crypto',
  CONVERTER: 'converter',
  GENERATOR: 'generator',
  UTILITY: 'utility'
} as const;

export type ToolCategory = typeof ToolCategory[keyof typeof ToolCategory];

// Base64工具接口
export interface Base64ToolState {
  input: string;
  output: string;
  mode: 'encode' | 'decode';
  error?: string;
}
