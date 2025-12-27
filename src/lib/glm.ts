
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
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4v',
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
                  url: base64Image
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 4096
      })
    });

    if (response.status === 429) {
      return { content: '', isRateLimit: true, error: 'Rate limit exceeded' };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
