import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface Team {
  name: string;
  members: string[];
}

export function TeamRandomizerTool() {
  const [names, setNames] = useState('张三\n李四\n王五\n赵六\n钱七\n孙八');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);

  const randomizeTeams = () => {
    const nameList = names
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (nameList.length === 0 || teamCount < 1) return;

    // 随机打乱数组
    const shuffled = [...nameList].sort(() => Math.random() - 0.5);

    // 分配到各个组 - 采用轮流分配方式确保平均
    const newTeams: Team[] = [];
    for (let i = 0; i < teamCount; i++) {
      newTeams.push({
        name: `第 ${i + 1} 组`,
        members: []
      });
    }

    // 轮流分配成员
    shuffled.forEach((member, index) => {
      newTeams[index % teamCount].members.push(member);
    });

    setTeams(newTeams);
  };

  const teamColors = [
    'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
    'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
    'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
    'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
    'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icons.Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">随机分组工具</CardTitle>
              <CardDescription className="mt-1">
                输入名单，快速公平地生成随机团队
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">成员名单</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="每行一个名字..."
              className="min-h-[300px] font-mono"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>共 {names.split('\n').filter(n => n.trim()).length} 人</span>
              {names.split('\n').filter(n => n.trim()).length % teamCount !== 0 && teamCount > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ⚠️ 除不尽，部分组人数可能不同
                </span>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">分成几组</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={teamCount}
                  onChange={(e) => setTeamCount(parseInt(e.target.value) || 1)}
                  className="flex-1"
                />
                <Button onClick={randomizeTeams} className="flex-1">
                  <Icons.Shuffle className="w-4 h-4 mr-2" />
                  开始分组
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="sm"
                  onClick={() => setTeamCount(num)}
                >
                  {num} 组
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 结果展示 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">分组结果</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Icons.Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>点击"开始分组"查看结果</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${teamColors[index % teamColors.length]}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      <Badge variant="secondary">{team.members.length} 人</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map((member, idx) => (
                        <Badge key={idx} variant="outline">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
          <p>• 每行输入一个成员姓名</p>
          <p>• 选择要分成的组数</p>
          <p>• 点击"开始分组"按钮，系统会自动随机分配</p>
          <p>• 适用于课堂分组、游戏队伍、工作团队等场景</p>
        </CardContent>
      </Card>
    </div>
  );
}
