import type {Tool, ToolCategory} from '@/types/tool';
import {ToolCategory as ToolCategoryValues} from '@/types/tool';

// 工具配置数据
export const tools: Tool[] = [
    {
        id: 'json-formatter',
        name: 'JSON 格式化',
        description: 'JSON数据格式化、压缩和验证',
        icon: 'Braces',
        category: ToolCategoryValues.TEXT,
        path: '/json-formatter'
    },
    {
        id: 'text-diff',
        name: '文本 Diff 对比',
        description: '使用 Monaco 显示原始与修改文本的差异',
        icon: 'GitDiff',
        category: ToolCategoryValues.TEXT,
        path: '/text-diff'
    },
    {
        id: 'yaml-formatter',
        name: 'YAML 格式化',
        description: 'YAML数据格式化和验证',
        icon: 'FileText',
        category: ToolCategoryValues.TEXT,
        path: '/yaml-formatter'
    },
    {
        id: 'base64',
        name: 'Base64 编码/解码',
        description: '对文本进行Base64编码和解码操作',
        icon: 'Binary',
        category: ToolCategoryValues.ENCODING,
        path: '/base64'
    },

    {
        id: 'base58',
        name: 'Base58 编码/解码',
        description: '对文本进行Base58编码和解码操作，常用于比特币地址等',
        icon: 'Hash',
        category: ToolCategoryValues.ENCODING,
        path: '/base58'
    },
    {
        id: 'base32',
        name: 'Base32 编码/解码',
        description: '对文本进行Base32编码和解码操作，常用于TOTP等场景',
        icon: 'Key',
        category: ToolCategoryValues.ENCODING,
        path: '/base32'
    },
    {
        id: 'unicode',
        name: 'Unicode 编码/解码',
        description: 'Unicode字符与编码之间的相互转换',
        icon: 'Type',
        category: ToolCategoryValues.ENCODING,
        path: '/unicode'
    },

    // {
    //     id: 'xml-formatter',
    //     name: 'XML 格式化',
    //     description: 'XML数据格式化和美化',
    //     icon: 'Code',
    //     category: ToolCategoryValues.TEXT,
    //     path: '/xml-formatter'
    // },
    {
        id: 'html-formatter',
        name: 'HTML 格式化',
        description: 'HTML代码格式化和美化',
        icon: 'Globe',
        category: ToolCategoryValues.TEXT,
        path: '/html-formatter'
    },
    {
        id: 'timestamp-converter',
        name: '时间戳转换',
        description: '时间戳与日期时间的相互转换',
        icon: 'Clock',
        category: ToolCategoryValues.CONVERTER,
        path: '/timestamp-converter'
    },
    {
        id: 'pixel-art',
        name: '图片转像素画',
        description: '将普通图片转换为像素艺术风格',
        icon: 'Image',
        category: ToolCategoryValues.CONVERTER,
        path: '/pixel-art'
    },
    {
        id: 'url-codec',
        name: 'URL 编码/解码',
        description: 'URL参数编码解码，处理特殊字符',
        icon: 'Link',
        category: ToolCategoryValues.ENCODING,
        path: '/url-codec'
    },
    {
        id: 'uuid-generator',
        name: 'UUID 生成器',
        description: '生成全局唯一标识符，支持批量生成',
        icon: 'Fingerprint',
        category: ToolCategoryValues.GENERATOR,
        path: '/uuid-generator'
    },
    {
        id: 'color-picker',
        name: '颜色选择器',
        description: 'HEX/RGB/HSL颜色格式互转',
        icon: 'Palette',
        category: ToolCategoryValues.UTILITY,
        path: '/color-picker'
    },
    {
        id: 'hash',
        name: 'MD5/SHA 哈希',
        description: '计算文本的 MD5、SHA-1、SHA-256、SHA-512 哈希值',
        icon: 'ShieldCheck',
        category: ToolCategoryValues.CRYPTO,
        path: '/hash'
    },
    {
        id: 'password-generator',
        name: '随机密码生成器',
        description: '生成安全的随机密码，支持自定义规则',
        icon: 'KeyRound',
        category: ToolCategoryValues.GENERATOR,
        path: '/password-generator'
    },
    {
        id: 'base-converter',
        name: '进制转换器',
        description: '二/八/十/十六进制互转',
        icon: 'Binary',
        category: ToolCategoryValues.CONVERTER,
        path: '/base-converter'
    },
    {
        id: 'qr-code-generator',
        name: '二维码生成器',
        description: '将文本、URL或数据转换为二维码图片',
        icon: 'QrCode',
        category: ToolCategoryValues.GENERATOR,
        path: '/qr-code-generator'
    },
    {
        id: 'regex-tester',
        name: '正则表达式测试器',
        description: '测试和调试正则表达式，实时查看匹配结果',
        icon: 'Search',
        category: ToolCategoryValues.UTILITY,
        path: '/regex-tester'
    },
    {
        id: 'jwt-decoder',
        name: 'JWT 解码器',
        description: '解析和查看 JSON Web Token 的内容',
        icon: 'Shield',
        category: ToolCategoryValues.CRYPTO,
        path: '/jwt-decoder'
    },
    {
        id: 'cron-parser',
        name: 'Cron 表达式解析器',
        description: '解析和验证 Cron 表达式，预测执行时间',
        icon: 'Clock',
        category: ToolCategoryValues.UTILITY,
        path: '/cron-parser'
    },
    {
        id: 'markdown-editor',
        name: 'Markdown 编辑器',
        description: 'Markdown 实时预览和导出',
        icon: 'FileEdit',
        category: ToolCategoryValues.TEXT,
        path: '/markdown-editor'
    },
    {
        id: 'sql-formatter',
        name: 'SQL 格式化',
        description: 'SQL 语句格式化和美化',
        icon: 'Database',
        category: ToolCategoryValues.TEXT,
        path: '/sql-formatter'
    },
    {
        id: 'csv-json-converter',
        name: 'CSV/JSON 互转',
        description: 'CSV 与 JSON 格式互相转换',
        icon: 'Table',
        category: ToolCategoryValues.CONVERTER,
        path: '/csv-json-converter'
    },
    {
        id: 'aes-encryption',
        name: 'AES/DES 加密',
        description: '对称加密解密工具',
        icon: 'Lock',
        category: ToolCategoryValues.CRYPTO,
        path: '/aes-encryption'
    },
    {
        id: 'html-escape',
        name: 'HTML 转义',
        description: 'HTML 实体编码/解码',
        icon: 'Code2',
        category: ToolCategoryValues.TEXT,
        path: '/html-escape'
    },
    {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum 生成器',
        description: '占位文本生成工具',
        icon: 'Type',
        category: ToolCategoryValues.GENERATOR,
        path: '/lorem-ipsum'
    },
    {
        id: 'user-agent-parser',
        name: 'User-Agent 解析器',
        description: '解析浏览器 User-Agent 字符串',
        icon: 'Monitor',
        category: ToolCategoryValues.UTILITY,
        path: '/user-agent-parser'
    },
    {
        id: 'bcrypt',
        name: 'Bcrypt 哈希',
        description: '生成和验证 Bcrypt 密码哈希',
        icon: 'ShieldCheck',
        category: ToolCategoryValues.CRYPTO,
        path: '/bcrypt'
    },
    {
        id: 'text-case',
        name: '文本大小写转换',
        description: '大写、小写、驼峰等格式转换',
        icon: 'CaseSensitive',
        category: ToolCategoryValues.TEXT,
        path: '/text-case'
    },
    {
        id: 'image-base64',
        name: '图片 Base64 互转',
        description: '图片与 Base64 字符串互转',
        icon: 'Image',
        category: ToolCategoryValues.CONVERTER,
        path: '/image-base64'
    },
    {
        id: 'barcode',
        name: '条形码生成器',
        description: '生成各种格式的条形码',
        icon: 'ScanBarcode',
        category: ToolCategoryValues.GENERATOR,
        path: '/barcode'
    },
    {
        id: 'keyboard-inspector',
        name: '键盘事件检测器',
        description: '检测键盘按键事件详细信息',
        icon: 'Keyboard',
        category: ToolCategoryValues.UTILITY,
        path: '/keyboard-inspector'
    },
    {
        id: 'ascii-art',
        name: 'ASCII 艺术生成器',
        description: '将文本转换为字符艺术',
        icon: 'Type',
        category: ToolCategoryValues.GENERATOR,
        path: '/ascii-art'
    },
    {
        id: 'text-to-speech',
        name: '文字转语音',
        description: '将文本转换为语音播放',
        icon: 'Volume2',
        category: ToolCategoryValues.UTILITY,
        path: '/text-to-speech'
    },
    {
        id: 'team-randomizer',
        name: '随机分组工具',
        description: '输入名单快速公平地生成随机团队',
        icon: 'Users',
        category: ToolCategoryValues.UTILITY,
        path: '/team-randomizer'
    },
    {
        id: 'scoreboard',
        name: '记分板',
        description: '红蓝双方比分记录',
        icon: 'Trophy',
        category: ToolCategoryValues.UTILITY,
        path: '/scoreboard'
    },
    {
        id: 'wheel-spinner',
        name: '大转盘/轮盘抽奖',
        description: '随机抽奖决策工具',
        icon: 'Disc3',
        category: ToolCategoryValues.GENERATOR,
        path: '/wheel-spinner'
    },
    {
        id: 'pomodoro',
        name: '番茄钟',
        description: '番茄工作法计时器',
        icon: 'Timer',
        category: ToolCategoryValues.UTILITY,
        path: '/pomodoro'
    },
    {
        id: 'counter',
        name: '计数器',
        description: '简单的计数工具',
        icon: 'Hash',
        category: ToolCategoryValues.UTILITY,
        path: '/counter'
    },
    {
        id: 'countdown',
        name: '倒数计时器',
        description: '设置倒计时到时提醒',
        icon: 'Clock',
        category: ToolCategoryValues.UTILITY,
        path: '/countdown'
    },
    {
        id: 'stopwatch',
        name: '秒表',
        description: '精确计时支持记圈',
        icon: 'Timer',
        category: ToolCategoryValues.UTILITY,
        path: '/stopwatch'
    },
    {
        id: 'coin-flip',
        name: '抛硬币',
        description: '随机正反面决策',
        icon: 'Circle',
        category: ToolCategoryValues.GENERATOR,
        path: '/coin-flip'
    },
    {
        id: 'ip-converter',
        name: 'IP地址进制转换',
        description: 'IP地址在十进制、二进制、十六进制之间相互转换',
        icon: 'Network',
        category: ToolCategoryValues.CONVERTER,
        path: '/ip-converter'
    },
    {
        id: 'ip-calculator',
        name: 'IP地址计算工具',
        description: '子网掩码计算、网络地址范围、子网划分、广播地址计算',
        icon: 'Calculator',
        category: ToolCategoryValues.UTILITY,
        path: '/ip-calculator'
    }
];

// 按分类获取工具
export const getToolsByCategory = (category: ToolCategory): Tool[] => {
    return tools.filter(tool => tool.category === category);
};

// 获取所有分类
export const getAllCategories = (): ToolCategory[] => {
    return Array.from(new Set(tools.map(tool => tool.category))) as ToolCategory[];
};

// 分类显示名称映射
export const categoryNames: Record<ToolCategory, string> = {
    [ToolCategoryValues.ENCODING]: '编码工具',
    [ToolCategoryValues.TEXT]: '文本工具',
    [ToolCategoryValues.CRYPTO]: '加密工具',
    [ToolCategoryValues.CONVERTER]: '转换工具',
    [ToolCategoryValues.GENERATOR]: '生成工具',
    [ToolCategoryValues.UTILITY]: '实用工具'
};
