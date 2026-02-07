import {Card, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {getAllCategories, categoryNames, getToolsByCategory} from '@/data/tools';
import * as Icons from 'lucide-react';
import {Link} from 'react-router-dom';

export default function Home() {
    const categories = getAllCategories();

    const getIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-6 h-6"/> : <Icons.Wrench className="w-6 h-6"/>;
    };

    return (
        <div className="space-y-8">
            {/* 工具分类展示 */}
            {categories.map(category => {
                const categoryTools = getToolsByCategory(category);
                if (categoryTools.length === 0) return null;

                return (
                    <div key={category} className="space-y-4">
                        <h3 className="text-xl font-semibold text-foreground flex items-center">
                            <Icons.Folder className="w-5 h-5 mr-2 text-primary"/>
                            {categoryNames[category]}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categoryTools.map(tool => (
                                <Link key={tool.id} to={tool.path} className="h-full">
                                    <Card
                                        className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700 hover:border-orange-400 h-full flex flex-col">
                                        <CardHeader className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    {getIcon(tool.icon)}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                                                </div>
                                            </div>
                                            <CardDescription className="text-sm leading-relaxed">
                                                {tool.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
