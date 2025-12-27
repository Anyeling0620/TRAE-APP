import React, { useState } from 'react';
import { useKeyPoolStore } from './useKeyPoolStore';
import { Button, Input, Card, Label } from '../../components/ui/primitives';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Trash2, Check, Eye, EyeOff, Settings } from 'lucide-react';

export const KeyPoolConfig = () => {
  const { keys, addKey, removeKey, toggleKey } = useKeyPoolStore();
  const [newKey, setNewKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'claude' | 'glm'>('glm');
  const [showKeys, setShowKeys] = useState(false);

  const handleAddKey = () => {
    if (newKey.trim()) {
      addKey(newKey.trim(), provider);
      setNewKey('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>配置 Keys</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>API Key 管理 (Key Management)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="key">输入 API Key</Label>
              <Input
                id="key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="sk-..."
                type={showKeys ? "text" : "password"}
              />
            </div>
            <div className="grid gap-2 w-28">
              <Label>模型厂商</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'openai' | 'claude' | 'glm')}
              >
                <option value="glm">Zhipu GLM</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
              </select>
            </div>
            <Button onClick={handleAddKey}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-end">
             <Button variant="ghost" size="sm" onClick={() => setShowKeys(!showKeys)}>
                {showKeys ? <EyeOff className="h-3 w-3 mr-2" /> : <Eye className="h-3 w-3 mr-2" />}
                {showKeys ? '隐藏 Keys' : '显示 Keys'}
             </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {keys.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">暂无 API Key，请添加。</p>
            )}
            {keys.map((k) => (
              <Card key={k.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full ${k.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex flex-col">
                    <span className="font-medium text-xs uppercase text-muted-foreground">{k.provider}</span>
                    <span className="text-sm truncate max-w-[200px] font-mono">
                       {showKeys ? '•'.repeat(20) : '••••••••••••••••'} 
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleKey(k.id)} title="切换启用状态">
                    <Check className={`h-4 w-4 ${k.isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeKey(k.id)} title="删除">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
