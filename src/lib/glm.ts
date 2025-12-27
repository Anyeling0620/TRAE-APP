
export interface GLMResponse {
  content: string;
  error?: string;
  isRateLimit?: boolean;
}

export const processImageWithGLM = async (
  apiKey: string,
  base64Image: string
): Promise<GLMResponse> => {
  try {
    // 智谱 OpenAI 兼容接口
    // 注意：某些实现可能对 base64 格式有特定要求。通常标准的 data uri 是最安全的。
    // 如果仍然报错，可能需要检查 token 限制或 model 名称。
    
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // 智谱支持直接使用 API Key (兼容模式)
      },
      body: JSON.stringify({
        model: 'glm-4v', // 确保使用视觉模型
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请将图片中的文字、表格和公式精准还原为 Markdown 格式。公式使用 LaTeX，保持原始排版结构，不要输出任何无关的解释说明。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image // 应该是 data:image/jpeg;base64,...
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 1024, // 降低 token 限制以避免 Invalid Parameter
        stream: false
      })
    });

    if (response.status === 429) {
      return { content: '', isRateLimit: true, error: 'Rate limit exceeded' };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 增加对 Invalid Parameter 的详细调试信息
      console.error('GLM API Error Data:', errorData);
      return { 
        content: '', 
        error: errorData.error?.message || `API request failed with status ${response.status}` 
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    return { content };
  } catch (error) {
    return { 
      content: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};
