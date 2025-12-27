import { PDFPageImage } from '../features/FileParser/PDFProcessor';

interface AIRequestOptions {
  apiKey: string;
  provider: 'openai' | 'claude';
  images: PDFPageImage[];
  onProgress?: (stage: string) => void;
}

const SYSTEM_PROMPT = `
You are a specialized academic document parser. Your task is to convert the provided images of a PDF document into high-quality Markdown.
Follow these strict rules:
1. Extract ALL text content accurately.
2. Preserve the original heading hierarchy (H1, H2, H3, etc.).
3. Convert ALL mathematical formulas to standard LaTeX format (e.g., $E=mc^2$ or $$...$$).
4. Convert ALL tables to standard Markdown tables.
5. REMOVE headers, footers, and page numbers.
6. Ignore purely decorative elements.
7. Return ONLY the Markdown content, no conversational filler.
`;

export const processDocumentWithAI = async ({
  apiKey,
  provider,
  images,
  onProgress,
}: AIRequestOptions): Promise<string> => {
  if (!apiKey) throw new Error('API Key is missing');

  // Limit to first 5 pages for demo/cost reasons if too many, or handle pagination
  // For this "Single Page App" demo, we'll process pages in batches or one by one if needed.
  // To keep it simple, we'll assume a reasonable document size or just send all images if supported.
  // OpenAI Vision has limits. It's often better to send page by page or small batches.
  // Let's implement a loop to process page by page and concatenate.
  
  let fullMarkdown = '';

  for (const img of images) {
    if (onProgress) onProgress(`Processing page ${img.pageNumber}...`);
    
    const pageContent = await processPage(apiKey, provider, img.dataUrl);
    fullMarkdown += pageContent + '\n\n';
  }

  return fullMarkdown;
};

const processPage = async (apiKey: string, provider: 'openai' | 'claude', base64Image: string): Promise<string> => {
  const base64Data = base64Image.split(',')[1];

  if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Or gpt-4-turbo
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Convert this page to Markdown.' },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } else {
    // Claude API (Anthropic)
    // Note: Claude API requires a proxy or specific headers (x-api-key, anthropic-version)
    // Browsers block CORS for Anthropic API usually. In a real app, this needs a backend proxy.
    // For this demo, we will attempt direct call but warn about CORS if it fails, 
    // or assume the user has a proxy/configured environment.
    // However, since this is a "Single Page App" requested to run in browser, 
    // we might encounter CORS. 
    // OpenAI also has CORS issues sometimes but 'dangerouslyAllowBrowser' is client-lib specific. 
    // Fetch usually hits CORS.
    // We will assume the user handles CORS (e.g. via a browser extension or local proxy) or the API allows it (OpenAI allows it if you don't use the SDK which blocks it, but direct fetch might still get blocked depending on settings).
    // Actually OpenAI blocks direct browser requests for security keys. 
    // BUT the user asked for a "Single Page App" with "Keys in LocalStorage", implying client-side usage.
    // We will implement the fetch.
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        // 'dangerously-allow-browser': 'true' // Not a header, but a concept.
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SYSTEM_PROMPT },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Data,
                },
              },
              { type: 'text', text: 'Convert this page to Markdown.' },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
        // Handle CORS or API errors
        const errorText = await response.text();
        throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }
};
