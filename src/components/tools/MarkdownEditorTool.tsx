import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState(`# 欢迎使用 Markdown 编辑器

## 功能特性

- **实时预览**：支持 GitHub Flavored Markdown
- **语法高亮**：代码块自动高亮
- **表格支持**：创建美观的表格
- **任务列表**：待办事项管理

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## 表格示例

| 功能 | 状态 | 优先级 |
|------|------|--------|
| 实时预览 | ✅ | 高 |
| 导出 HTML | ✅ | 中 |
| 语法检查 | 🔄 | 低 |

## 任务列表

- [x] 完成基础编辑器
- [x] 添加预览功能
- [ ] 添加更多主题
`);

  const [copySuccess, setCopySuccess] = useState<string>('');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const exportHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; }
  </style>
</head>
<body>
${markdown.split('\n').map(line => {
        if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
        if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
        return `<p>${line}</p>`;
    }).join('\n')}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setMarkdown('');
  };

  const loadTemplate = (template: string) => {
    const templates = {
      readme: `# 项目名称

## 简介
这是一个示例项目的 README 文档。

## 安装
\`\`\`bash
npm install
\`\`\`

## 使用方法
\`\`\`bash
npm start
\`\`\`

## 贡献指南
欢迎提交 Pull Request！

## 许可证
MIT License`,
      blog: `# 博客文章标题

**发布日期：** 2024-01-01

## 引言
这里是文章的引言部分...

## 正文
这里是文章的主要内容...

### 小标题 1
内容...

### 小标题 2
内容...

## 结论
这里是文章的结论...

---
*作者：Your Name*`,
      notes: `# 学习笔记

## 📚 主题
Markdown 语法学习

## ✏️ 要点
- 标题使用 # 符号
- 列表使用 - 或 * 符号  
- 代码块使用三个反引号

## 💡 示例
\`\`\`markdown
# 这是一级标题
## 这是二级标题
\`\`\`

## 📝 总结
Markdown 是一种轻量级标记语言...`
    };
    setMarkdown(templates[template as keyof typeof templates] || '');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.FileEdit className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Markdown 编辑器</CardTitle>
                <CardDescription className="mt-1">
                  实时预览 Markdown 文档，支持 GitHub Flavored Markdown 和导出 HTML
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => loadTemplate('readme')} variant="outline">
              <Icons.FileText className="w-4 h-4 mr-2" />
              README 模板
            </Button>
            <Button onClick={() => loadTemplate('blog')} variant="outline">
              <Icons.BookOpen className="w-4 h-4 mr-2" />
              博客模板
            </Button>
            <Button onClick={() => loadTemplate('notes')} variant="outline">
              <Icons.StickyNote className="w-4 h-4 mr-2" />
              笔记模板
            </Button>
            <Button onClick={exportHtml} variant="outline">
              <Icons.Download className="w-4 h-4 mr-2" />
              导出 HTML
            </Button>
            <Button onClick={clearAll} variant="outline">
              <Icons.Trash2 className="w-4 h-4 mr-2" />
              清空内容
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 编辑器和预览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 编辑器 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">编辑器</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Icons.FileEdit className="w-3 h-3 mr-1" />
                  {markdown.split('\n').length} 行
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(markdown, 'markdown')}
                  disabled={!markdown}
                >
                  {copySuccess === 'markdown' ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <Icons.Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="输入 Markdown 内容..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="min-h-[500px] font-mono text-sm resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              字符数: {markdown.length} | 单词数: {markdown.split(/\s+/).filter(Boolean).length}
            </div>
          </CardContent>
        </Card>

        {/* 预览 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">预览</CardTitle>
              <Badge variant="default" className="text-xs">
                <Icons.Eye className="w-3 h-3 mr-1" />
                实时预览
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none min-h-[500px] p-4 border rounded-lg overflow-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {markdown || '*预览区域将显示渲染后的 Markdown 内容...*'}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            Markdown 语法指南
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">基础语法</h4>
              <ul className="space-y-1 font-mono text-xs">
                <li># 一级标题</li>
                <li>## 二级标题</li>
                <li>**粗体文本**</li>
                <li>*斜体文本*</li>
                <li>[链接](url)</li>
                <li>![图片](url)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">高级功能</h4>
              <ul className="space-y-1 font-mono text-xs">
                <li>- [ ] 任务列表</li>
                <li>```language 代码块```</li>
                <li>| 表格 | 语法 |</li>
                <li>&gt; 引用文本</li>
                <li>--- 分割线</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：支持 GitHub Flavored Markdown (GFM) 扩展语法，包括表格、任务列表、删除线等。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
