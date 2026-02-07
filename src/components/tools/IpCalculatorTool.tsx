import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  firstUsableHost: string;
  lastUsableHost: string;
  cidrNotation: string;
  subnetClass: string;
  isPrivate: boolean;
}

interface SubnetDivision {
  subnetNumber: number;
  networkAddress: string;
  broadcastAddress: string;
  hostRange: string;
  usableHosts: number;
}

export function IpCalculatorTool() {
  const [ipAddress, setIpAddress] = useState('192.168.1.100');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [cidrPrefix, setCidrPrefix] = useState('24');
  const [subnetInfo, setSubnetInfo] = useState<SubnetInfo | null>(null);
  const [subnetDivisions, setSubnetDivisions] = useState<SubnetDivision[]>([]);
  const [divisionCount, setDivisionCount] = useState('4');
  const [error, setError] = useState<string>('');

  // 验证IP地址格式
  const isValidIpAddress = (ip: string): boolean => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  // 验证子网掩码
  const isValidSubnetMask = (mask: string): boolean => {
    if (!isValidIpAddress(mask)) return false;
    
    const parts = mask.split('.').map(part => parseInt(part, 10));
    const binary = parts.map(num => num.toString(2).padStart(8, '0')).join('');
    
    // 检查是否为连续的1后跟连续的0
    const match = binary.match(/^(1*)(0*)$/);
    return match !== null && match[1].length + match[2].length === 32;
  };

  // IP地址转为32位整数
  const ipToInt = (ip: string): number => {
    const parts = ip.split('.').map(part => parseInt(part, 10));
    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  };

  // 32位整数转为IP地址
  const intToIp = (int: number): string => {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.');
  };

  // CIDR前缀转子网掩码
  const cidrToSubnetMask = (cidr: number): string => {
    const mask = (0xFFFFFFFF << (32 - cidr)) >>> 0;
    return intToIp(mask);
  };

  // 子网掩码转CIDR前缀
  const subnetMaskToCidr = (mask: string): number => {
    const parts = mask.split('.').map(part => parseInt(part, 10));
    const binary = parts.map(num => num.toString(2).padStart(8, '0')).join('');
    return binary.split('1').length - 1;
  };

  // 判断IP地址类别
  const getIpClass = (ip: string): string => {
    const firstOctet = parseInt(ip.split('.')[0], 10);
    if (firstOctet >= 1 && firstOctet <= 126) return 'A类';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B类';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C类';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D类（组播）';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E类（保留）';
    return '未知';
  };

  // 判断是否为私有IP
  const isPrivateIp = (ip: string): boolean => {
    const parts = ip.split('.').map(part => parseInt(part, 10));
    const [a, b, c] = parts;
    
    return (
      (a === 10) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) // 链路本地地址
    );
  };

  // 计算子网信息
  const calculateSubnetInfo = useCallback(() => {
    setError('');
    
    if (!isValidIpAddress(ipAddress)) {
      setError('无效的IP地址格式');
      return;
    }

    let mask: string;
    let cidr: number;

    // 根据输入方式确定子网掩码和CIDR
    if (cidrPrefix && !isNaN(parseInt(cidrPrefix))) {
      cidr = parseInt(cidrPrefix);
      if (cidr < 0 || cidr > 32) {
        setError('CIDR前缀必须在0-32之间');
        return;
      }
      mask = cidrToSubnetMask(cidr);
      setSubnetMask(mask);
    } else if (subnetMask && isValidSubnetMask(subnetMask)) {
      mask = subnetMask;
      cidr = subnetMaskToCidr(mask);
      setCidrPrefix(cidr.toString());
    } else {
      setError('请输入有效的子网掩码或CIDR前缀');
      return;
    }

    const ipInt = ipToInt(ipAddress);
    const maskInt = ipToInt(mask);
    const wildcardInt = ~maskInt >>> 0;
    
    const networkInt = ipInt & maskInt;
    const broadcastInt = networkInt | wildcardInt;
    
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = Math.max(0, totalHosts - 2);
    
    const firstUsableInt = networkInt + 1;
    const lastUsableInt = broadcastInt - 1;

    const info: SubnetInfo = {
      networkAddress: intToIp(networkInt),
      broadcastAddress: intToIp(broadcastInt),
      subnetMask: mask,
      wildcardMask: intToIp(wildcardInt),
      totalHosts,
      usableHosts,
      firstUsableHost: usableHosts > 0 ? intToIp(firstUsableInt) : 'N/A',
      lastUsableHost: usableHosts > 0 ? intToIp(lastUsableInt) : 'N/A',
      cidrNotation: `${intToIp(networkInt)}/${cidr}`,
      subnetClass: getIpClass(ipAddress),
      isPrivate: isPrivateIp(ipAddress)
    };

    setSubnetInfo(info);
  }, [ipAddress, subnetMask, cidrPrefix]);

  // 子网划分
  const calculateSubnetDivision = useCallback(() => {
    if (!subnetInfo) {
      setError('请先计算基本子网信息');
      return;
    }

    const count = parseInt(divisionCount);
    if (isNaN(count) || count < 2 || count > 256) {
      setError('子网数量必须在2-256之间');
      return;
    }

    // 计算需要的位数
    const bitsNeeded = Math.ceil(Math.log2(count));
    const currentCidr = parseInt(cidrPrefix);
    const newCidr = currentCidr + bitsNeeded;
    
    if (newCidr > 30) {
      setError('子网划分过多，无法提供足够的主机位');
      return;
    }

    const subnetSize = Math.pow(2, 32 - newCidr);
    const networkInt = ipToInt(subnetInfo.networkAddress);
    
    const divisions: SubnetDivision[] = [];
    
    for (let i = 0; i < count; i++) {
      const subnetNetworkInt = networkInt + (i * subnetSize);
      const subnetBroadcastInt = subnetNetworkInt + subnetSize - 1;
      const subnetUsableHosts = subnetSize - 2;
      
      divisions.push({
        subnetNumber: i + 1,
        networkAddress: intToIp(subnetNetworkInt),
        broadcastAddress: intToIp(subnetBroadcastInt),
        hostRange: `${intToIp(subnetNetworkInt + 1)} - ${intToIp(subnetBroadcastInt - 1)}`,
        usableHosts: Math.max(0, subnetUsableHosts)
      });
    }

    setSubnetDivisions(divisions);
  }, [subnetInfo, divisionCount, cidrPrefix]);

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">IP地址计算工具</CardTitle>
              <CardDescription className="mt-1">
                计算子网掩码、网络地址范围、子网划分、广播地址和可用主机数量
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">IP地址</label>
              <Input
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="例：192.168.1.100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">子网掩码</label>
              <Input
                value={subnetMask}
                onChange={(e) => setSubnetMask(e.target.value)}
                placeholder="例：255.255.255.0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CIDR前缀</label>
              <Input
                value={cidrPrefix}
                onChange={(e) => setCidrPrefix(e.target.value)}
                placeholder="例：24"
                type="number"
                min="0"
                max="32"
              />
            </div>
          </div>
          
          <Button onClick={calculateSubnetInfo} className="w-full">
            <Icons.Calculator className="w-4 h-4 mr-2" />
            计算子网信息
          </Button>
        </CardContent>
      </Card>

      {/* 错误信息 */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Icons.AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 子网信息结果 */}
      {subnetInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Network className="w-4 h-4" />
                网络信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">网络地址</div>
                <div className="font-mono text-sm">{subnetInfo.networkAddress}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">广播地址</div>
                <div className="font-mono text-sm">{subnetInfo.broadcastAddress}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">CIDR表示法</div>
                <div className="font-mono text-sm">{subnetInfo.cidrNotation}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Shield className="w-4 h-4" />
                掩码信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">子网掩码</div>
                <div className="font-mono text-sm">{subnetInfo.subnetMask}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">通配符掩码</div>
                <div className="font-mono text-sm">{subnetInfo.wildcardMask}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">IP类别</div>
                <div className="text-sm">{subnetInfo.subnetClass}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.Users className="w-4 h-4" />
                主机信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">总主机数</div>
                <div className="font-semibold">{subnetInfo.totalHosts.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">可用主机数</div>
                <div className="font-semibold">{subnetInfo.usableHosts.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">IP类型</div>
                <Badge variant={subnetInfo.isPrivate ? "secondary" : "outline"}>
                  {subnetInfo.isPrivate ? '私有IP' : '公有IP'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icons.ArrowRightLeft className="w-4 h-4" />
                主机地址范围
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">第一个可用主机</div>
                  <div className="font-mono text-sm p-2 bg-muted rounded">
                    {subnetInfo.firstUsableHost}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">最后一个可用主机</div>
                  <div className="font-mono text-sm p-2 bg-muted rounded">
                    {subnetInfo.lastUsableHost}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 子网划分 */}
      {subnetInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icons.Split className="w-5 h-5" />
              子网划分
            </CardTitle>
            <CardDescription>
              将当前网络划分为多个子网
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">子网数量</label>
              <Input
                value={divisionCount}
                onChange={(e) => setDivisionCount(e.target.value)}
                placeholder="例：4"
                type="number"
                min="2"
                max="256"
                className="w-32"
              />
              <Button onClick={calculateSubnetDivision}>
                <Icons.Split className="w-4 h-4 mr-2" />
                划分子网
              </Button>
            </div>

            {subnetDivisions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">子网划分结果</h4>
                <div className="grid gap-3">
                  {subnetDivisions.map((subnet) => (
                    <Card key={subnet.subnetNumber} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">子网 {subnet.subnetNumber}</div>
                          <div className="font-mono">{subnet.networkAddress}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">广播地址</div>
                          <div className="font-mono">{subnet.broadcastAddress}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">主机范围</div>
                          <div className="font-mono text-xs">{subnet.hostRange}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">可用主机</div>
                          <div className="font-semibold">{subnet.usableHosts}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Icons.Info className="w-5 h-5 mr-2" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">基本功能</h4>
              <ul className="space-y-1">
                <li>• 计算网络地址和广播地址</li>
                <li>• 确定可用主机数量和范围</li>
                <li>• 子网掩码与CIDR互转</li>
                <li>• 识别IP地址类别和类型</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">子网划分</h4>
              <ul className="space-y-1">
                <li>• 将网络划分为多个子网</li>
                <li>• 自动计算每个子网的地址范围</li>
                <li>• 显示每个子网的可用主机数</li>
                <li>• 支持2-256个子网划分</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 提示：可以通过子网掩码或CIDR前缀来指定网络，工具会自动同步两种表示方法。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}