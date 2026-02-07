import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface JwtParts {
  header: any;
  payload: any;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
}

interface JwtState {
  token: string;
  parts: JwtParts | null;
  error: string | null;
  isValid: boolean;
}

export function JwtDecoderTool() {
  const [state, setState] = useState<JwtState>({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    parts: null,
    error: null,
    isValid: false
  });

  const base64UrlDecode = (str: string): string => {
    try {
      // 添加必要的填充
      const padding = '='.repeat((4 - (str.length % 4)) % 4);
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
      
      // 解码 base64
      const decoded = atob(base64);
      
      // 转换为 UTF-8
      return decodeURIComponent(
        decoded
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (error) {
      throw new Error('Base64URL 解码失败');
    }
  };

  const parseJwt = (token: string): JwtParts => {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('JWT 格式错误：应该包含三个部分（header.payload.signature）');
    }

    const [headerPart, payloadPart, signaturePart] = parts;

    try {
      const headerRaw = base64UrlDecode(headerPart);
      const payloadRaw = base64UrlDecode(payloadPart);
      
      const header = JSON.parse(headerRaw);
      const payload = JSON.parse(payloadRaw);

      return {
        header,
        payload,
        signature: signaturePart,
        headerRaw,
        payloadRaw
      };
    } catch (error) {
      throw new Error('JWT 解析失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const decodeJwt = () => {
    try {
      if (!state.token.trim()) {
        setState(prev => ({
          ...prev,
          parts: null,
          error: null,
          isValid: false
        }));
        return;
      }

      const parts = parseJwt(state.token.trim());
      
      setState(prev => ({
        ...prev,
        parts,
        error: null,
        isValid: true
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        parts: null,
        error: error instanceof Error ? error.message : 'JWT 解码失败',
        isValid: false
      }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(decodeJwt, 300);
    return () => clearTimeout(timeoutId);
  }, [state.token]);

  const formatTimestamp = (timestamp: number): string => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return '无效时间戳';
    }
  };

  const isExpired = (exp: number): boolean => {
    return Date.now() / 1000 > exp;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const sampleTokens = [
    {
      name: '标准 JWT',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    },
    {
      name: '带过期时间',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDB9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KM'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 工具标题和描述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icons.Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">JWT 解码器</CardTitle>
                <CardDescription className="mt-1">
                  解析和查看 JSON Web Token 的 Header、Payload 和 Signature
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* JWT 输入区域 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Key className="w-4 h-4" />
                JWT Token
              </CardTitle>
              <div className="flex gap-2">
                {state.error && (
                  <Badge variant="destructive" className="text-xs">
                    <Icons.AlertCircle className="w-3 h-3 mr-1" />
                    无效
                  </Badge>
                )}
                {state.isValid && (
                  <Badge variant="default" className="text-xs">
                    <Icons.CheckCircle className="w-3 h-3 mr-1" />
                    有效
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Textarea
                placeholder="粘贴 JWT token 到这里..."
                value={state.token}
                onChange={(e) => setState(prev => ({ ...prev, token: e.target.value }))}
                className={`min-h-[120px] font-mono text-sm ${state.error ? 'border-destructive' : ''}`}
              />
              {state.error && (
                <p className="text-sm text-destructive mt-2">{state.error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, token: '' }))}
              >
                <Icons.Trash2 className="w-3 h-3 mr-1" />
                清空
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(state.token)}
                disabled={!state.token}
              >
                <Icons.Copy className="w-3 h-3 mr-1" />
                复制
              </Button>
            </div>

            {/* 示例 Token */}
            <div>
              <label className="text-sm font-medium mb-2 block">示例 Token</label>
              <div className="space-y-1">
                {sampleTokens.map((sample, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setState(prev => ({ ...prev, token: sample.token }))}
                  >
                    <Icons.FileText className="w-3 h-3 mr-1" />
                    {sample.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 解码结果区域 */}
        <div className="space-y-4">
          {state.parts ? (
            <>
              {/* Header */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icons.Settings className="w-4 h-4" />
                      Header
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(state.parts!.header, null, 2))}
                    >
                      <Icons.Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/30 p-2 rounded-lg text-xs font-mono overflow-x-auto max-h-[120px] overflow-y-auto">
                    {JSON.stringify(state.parts.header, null, 2)}
                  </pre>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">算法:</span>
                      <Badge variant="secondary" className="text-xs">{state.parts.header.alg || 'N/A'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">类型:</span>
                      <Badge variant="secondary" className="text-xs">{state.parts.header.typ || 'N/A'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payload */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icons.Package className="w-4 h-4" />
                      Payload
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(state.parts!.payload, null, 2))}
                    >
                      <Icons.Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/30 p-2 rounded-lg text-xs font-mono overflow-x-auto max-h-[150px] overflow-y-auto">
                    {JSON.stringify(state.parts.payload, null, 2)}
                  </pre>
                  
                  {/* 关键声明 */}
                  <div className="mt-3 space-y-2">
                    {state.parts.payload.exp && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">过期时间:</span>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{state.parts.payload.exp}</span>
                            {isExpired(state.parts.payload.exp) ? (
                              <Badge variant="destructive" className="text-xs">已过期</Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">有效</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(state.parts.payload.exp)}
                          </div>
                        </div>
                      </div>
                    )}
                    {state.parts.payload.iat && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">签发时间:</span>
                        <div className="text-right">
                          <div className="font-mono">{state.parts.payload.iat}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(state.parts.payload.iat)}
                          </div>
                        </div>
                      </div>
                    )}
                    {state.parts.payload.sub && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">主题:</span>
                        <span className="font-mono">{state.parts.payload.sub}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Signature */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icons.FileSignature className="w-4 h-4" />
                      Signature
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(state.parts!.signature)}
                    >
                      <Icons.Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-2 rounded-lg font-mono text-xs break-all">
                    {state.parts.signature}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <Icons.AlertTriangle className="w-3 h-3 inline mr-1" />
                    此工具仅解码，不验证签名有效性
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Icons.Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base font-medium mb-2">输入 JWT Token</p>
                  <p className="text-sm">粘贴有效的 JWT token 查看解码结果</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}