import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import chroma from 'chroma-js';

interface ColorPickerState {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export function ColorPickerTool() {
  const [state, setState] = useState<ColorPickerState>({
    hex: '#3b82f6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 }
  });

  const [copySuccess, setCopySuccess] = useState<string>('');
  const [palettes, setPalettes] = useState<Record<string, string[]>>({});

  // HEX 转 RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // RGB 转 HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // RGB 转 HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // HSL 转 RGB
  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // 更新 HEX
  const updateHex = (hex: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
    
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setState({ hex, rgb, hsl });
  };

  // 更新 RGB
  const updateRgb = (r: number, g: number, b: number) => {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setState({ hex, rgb: { r, g, b }, hsl });
  };

  // 更新 HSL
  const updateHsl = (h: number, s: number, l: number) => {
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));
    
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setState({ hex, rgb, hsl: { h, s, l } });
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 生成随机颜色
  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    updateRgb(r, g, b);
  };

  // 生成调色板
  const generatePalettes = (baseColor: string) => {
    if (!chroma.valid(baseColor)) return;

    try {
      // 类比色 (相邻色)
      const analogous = [
        chroma(baseColor).set('hsl.h', '-30').hex(),
        chroma(baseColor).set('hsl.h', '-15').hex(),
        baseColor,
        chroma(baseColor).set('hsl.h', '+15').hex(),
        chroma(baseColor).set('hsl.h', '+30').hex(),
      ];

      // 单色系 (不同明度)
      const monochromatic = chroma.scale([baseColor, '#ffffff']).mode('lch').colors(5);

      // 三色系
      const triad = [
        baseColor,
        chroma(baseColor).set('hsl.h', '+120').hex(),
        chroma(baseColor).set('hsl.h', '+240').hex(),
      ];

      // 互补色
      const complementary = [
        baseColor,
        chroma(baseColor).set('hsl.h', '+180').hex(),
      ];

      // 四色系
      const tetradic = [
        baseColor,
        chroma(baseColor).set('hsl.h', '+90').hex(),
        chroma(baseColor).set('hsl.h', '+180').hex(),
        chroma(baseColor).set('hsl.h', '+270').hex(),
      ];

      setPalettes({
        analogous,
        monochromatic,
        triad,
        complementary,
        tetradic,
      });
    } catch (error) {
      console.error('生成调色板失败:', error);
    }
  };

  // 当颜色改变时生成调色板
  useEffect(() => {
    generatePalettes(state.hex);
  }, [state.hex]);

  // 预设颜色
  const presetColors = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Gray', hex: '#6b7280' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Palette className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">颜色选择器</CardTitle>
                <CardDescription className="mt-1">
                  HEX、RGB、HSL 颜色格式互转，支持取色和预设颜色
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 主要颜色显示 */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 颜色预览 */}
            <div className="space-y-4">
              <div 
                className="w-full h-48 rounded-lg border-2 border-border shadow-lg transition-all"
                style={{ backgroundColor: state.hex }}
              />
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={state.hex}
                  onChange={(e) => updateHex(e.target.value)}
                  className="h-12 cursor-pointer"
                />
                <Button onClick={randomColor} variant="outline" className="flex-1">
                  <Icons.Shuffle className="w-4 h-4 mr-2" />
                  随机颜色
                </Button>
              </div>
            </div>

            {/* 颜色值 */}
            <div className="space-y-4">
              {/* HEX */}
              <div>
                <label className="text-sm font-medium mb-2 block">HEX</label>
                <div className="flex gap-2">
                  <Input
                    value={state.hex}
                    onChange={(e) => updateHex(e.target.value)}
                    className="font-mono"
                    placeholder="#000000"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(state.hex, 'hex')}
                  >
                    {copySuccess === 'hex' ? (
                      <Icons.Check className="w-4 h-4" />
                    ) : (
                      <Icons.Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* RGB */}
              <div>
                <label className="text-sm font-medium mb-2 block">RGB</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={state.rgb.r}
                    onChange={(e) => updateRgb(parseInt(e.target.value) || 0, state.rgb.g, state.rgb.b)}
                    placeholder="R"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={state.rgb.g}
                    onChange={(e) => updateRgb(state.rgb.r, parseInt(e.target.value) || 0, state.rgb.b)}
                    placeholder="G"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={state.rgb.b}
                    onChange={(e) => updateRgb(state.rgb.r, state.rgb.g, parseInt(e.target.value) || 0)}
                    placeholder="B"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={`rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(`rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`, 'rgb')}
                  >
                    {copySuccess === 'rgb' ? (
                      <Icons.Check className="w-4 h-4" />
                    ) : (
                      <Icons.Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* HSL */}
              <div>
                <label className="text-sm font-medium mb-2 block">HSL</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    type="number"
                    min="0"
                    max="360"
                    value={state.hsl.h}
                    onChange={(e) => updateHsl(parseInt(e.target.value) || 0, state.hsl.s, state.hsl.l)}
                    placeholder="H"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={state.hsl.s}
                    onChange={(e) => updateHsl(state.hsl.h, parseInt(e.target.value) || 0, state.hsl.l)}
                    placeholder="S"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={state.hsl.l}
                    onChange={(e) => updateHsl(state.hsl.h, state.hsl.s, parseInt(e.target.value) || 0)}
                    placeholder="L"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={`hsl(${state.hsl.h}, ${state.hsl.s}%, ${state.hsl.l}%)`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(`hsl(${state.hsl.h}, ${state.hsl.s}%, ${state.hsl.l}%)`, 'hsl')}
                  >
                    {copySuccess === 'hsl' ? (
                      <Icons.Check className="w-4 h-4" />
                    ) : (
                      <Icons.Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预设颜色 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">预设颜色</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {presetColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => updateHex(color.hex)}
                className="group relative aspect-square rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg text-white text-xs font-medium transition-opacity">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 调色板生成器 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Palette className="w-5 h-5 mr-2" />
            调色板生成器
          </CardTitle>
          <CardDescription>
            基于当前颜色自动生成和谐的配色方案
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(palettes).map(([name, colors]) => (
            <div key={name}>
              <h4 className="font-medium text-foreground mb-2">
                {name === 'analogous' && '类比色 (Analogous)'}
                {name === 'monochromatic' && '单色系 (Monochromatic)'}
                {name === 'triad' && '三色系 (Triad)'}
                {name === 'complementary' && '互补色 (Complementary)'}
                {name === 'tetradic' && '四色系 (Tetradic)'}
              </h4>
              <div className="flex gap-2">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    className="h-12 flex-1 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 relative group"
                    style={{ backgroundColor: color }}
                    title={color}
                    onClick={() => updateHex(color)}
                  >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg text-white text-xs font-mono transition-opacity">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">HEX 格式</h4>
              <ul className="space-y-1">
                <li>• 十六进制颜色表示</li>
                <li>• 格式：#RRGGBB</li>
                <li>• 常用于 CSS、HTML</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">RGB 格式</h4>
              <ul className="space-y-1">
                <li>• 红绿蓝三通道</li>
                <li>• 范围：0-255</li>
                <li>• 直观易理解</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">HSL 格式</h4>
              <ul className="space-y-1">
                <li>• 色相、饱和度、亮度</li>
                <li>• H: 0-360, S/L: 0-100</li>
                <li>• 便于调整颜色</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：点击预设颜色或使用取色器快速选择，所有格式会自动同步更新。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
