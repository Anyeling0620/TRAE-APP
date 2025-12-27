import React from 'react';
import { useKeyPoolStore } from './useKeyPoolStore';
import { Card } from '../../components/ui/primitives';

export const KeyStatusMonitor = () => {
  const { keys } = useKeyPoolStore();
  const now = Date.now();

  const glmKeys = keys.filter(k => k.provider === 'glm');

  if (glmKeys.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        GLM Key 状态监控 (Key Status)
      </h4>
      <div className="grid gap-2">
        {glmKeys.map(key => {
          const isRateLimited = key.rateLimitExpiresAt && key.rateLimitExpiresAt > now;
          let statusColor = 'bg-green-500';
          let statusText = '就绪 (Ready)';
          
          if (!key.isActive) {
            statusColor = 'bg-gray-400';
            statusText = '已禁用 (Disabled)';
          } else if (isRateLimited) {
            statusColor = 'bg-red-500 animate-pulse';
            statusText = `冷却中 (Cooldown: ${Math.ceil((key.rateLimitExpiresAt! - now) / 1000)}s)`;
          }

          return (
            <Card key={key.id} className="p-2 flex items-center justify-between text-xs bg-muted/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                <span className="font-mono truncate w-24" title={key.label}>
                   {key.label || 'GLM Key'}
                </span>
              </div>
              <span className={`text-[10px] ${isRateLimited ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                {statusText}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
