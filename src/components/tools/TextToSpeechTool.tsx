import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

export function TextToSpeechTool() {
  const [text, setText] = useState('你好，欢迎使用文字转语音工具！');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // 按语言分类并排序：中文 > 英文 > 其他
      const sortedVoices = availableVoices.sort((a, b) => {
        const aIsChinese = a.lang.includes('zh');
        const bIsChinese = b.lang.includes('zh');
        const aIsEnglish = a.lang.includes('en');
        const bIsEnglish = b.lang.includes('en');
        
        if (aIsChinese && !bIsChinese) return -1;
        if (!aIsChinese && bIsChinese) return 1;
        if (aIsEnglish && !bIsEnglish && !bIsChinese) return -1;
        if (!aIsEnglish && bIsEnglish && !aIsChinese) return 1;
        
        return a.lang.localeCompare(b.lang);
      });
      
      setVoices(sortedVoices);
      
      // 选择默认中文语音
      const chineseVoice = sortedVoices.find(v => v.lang.includes('zh'));
      setSelectedVoice(chineseVoice || sortedVoices[0]);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = () => {
    if (!text.trim()) return;

    // 停止当前播放
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
  };

  const resume = () => {
    window.speechSynthesis.resume();
  };

  const examples = [
    { name: '中文', text: '你好，欢迎使用文字转语音工具！' },
    { name: 'English', text: 'Hello, welcome to the text to speech tool!' },
    { name: '日本語', text: 'こんにちは、テキスト読み上げツールへようこそ！' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Volume2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">文字转语音</CardTitle>
              <CardDescription className="mt-1">
                将文本转换为语音，支持多种语言和声音
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 控制面板 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">文本内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要转换为语音的文本..."
              className="min-h-[200px]"
            />
            <div className="text-xs text-muted-foreground">
              字符数: {text.length}
            </div>

            <div className="flex gap-2">
              <Button onClick={speak} disabled={isSpeaking || !text.trim()} className="flex-1">
                <Icons.Play className="w-4 h-4 mr-2" />
                播放
              </Button>
              <Button onClick={pause} disabled={!isSpeaking} variant="outline">
                <Icons.Pause className="w-4 h-4 mr-2" />
                暂停
              </Button>
              <Button onClick={resume} variant="outline">
                <Icons.Play className="w-4 h-4 mr-2" />
                继续
              </Button>
              <Button onClick={stop} disabled={!isSpeaking} variant="outline">
                <Icons.Square className="w-4 h-4 mr-2" />
                停止
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">快捷示例</label>
              <div className="flex gap-2">
                {examples.map((example) => (
                  <Button
                    key={example.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setText(example.text)}
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">语音设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">语音选择</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {/* 中文语音 */}
                <optgroup label="中文 (Chinese)">
                  {voices.filter(v => v.lang.includes('zh')).map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </optgroup>
                
                {/* 英文语音 */}
                <optgroup label="英文 (English)">
                  {voices.filter(v => v.lang.includes('en')).map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </optgroup>
                
                {/* 其他语言 */}
                <optgroup label="其他语言 (Others)">
                  {voices.filter(v => !v.lang.includes('zh') && !v.lang.includes('en')).map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">语速: {rate.toFixed(1)}</label>
              <Input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">音调: {pitch.toFixed(1)}</label>
              <Input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">音量: {(volume * 100).toFixed(0)}%</label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
            </div>

            {isSpeaking && (
              <Badge variant="default" className="w-full justify-center">
                <Icons.Volume2 className="w-3 h-3 mr-1 animate-pulse" />
                正在播放...
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 使用浏览器内置的 Web Speech API，无需安装额外软件</p>
          <p>• 支持多种语言，具体取决于您的操作系统和浏览器</p>
          <p>• 可调节语速、音调和音量以获得最佳效果</p>
          <p>• 推荐使用 Chrome 或 Edge 浏览器以获得最佳体验</p>
        </CardContent>
      </Card>
    </div>
  );
}
