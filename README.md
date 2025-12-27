# Smart-MD-Academic

Smart-MD-Academic is a Single Page Application (SPA) designed to convert PDF academic documents into high-quality Markdown for online reading. It features a secure API Key management system, AI-powered parsing, and offline persistence.

## Features

- **KeyPool Management**: Manage multiple OpenAI/Claude API keys with encryption and automatic rotation.
- **Smart PDF Parsing**: Drag & drop PDFs to convert them using AI vision models.
- **Academic Focused**: accurately extracts headings, LaTeX math formulas, tables, and removes headers/footers.
- **Split View Reader**: Side-by-side view of the file list/uploader and the rendered Markdown.
- **Offline Capable**: Stores parsed files in the browser's IndexedDB.
- **Modern UI**: Built with React, Tailwind CSS, and Shadcn UI style components.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Radix UI Primitives
- **State Management**: Zustand
- **Persistence**: IndexedDB (idb)
- **PDF Processing**: pdfjs-dist
- **Markdown Rendering**: react-markdown, remark-math, rehype-katex, react-syntax-highlighter
- **Security**: CryptoJS (AES encryption for keys)

## Setup

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run Development Server**:
    ```bash
    pnpm run dev
    ```

3.  **Build for Production**:
    ```bash
    pnpm run build
    ```

## Usage

1.  **Configure Keys**: Click the Key icon in the sidebar to add your OpenAI or Claude API keys. Keys are stored encrypted in your browser.
2.  **Upload PDF**: Drag and drop a PDF file into the upload area.
3.  **Process**: The app will extract images from the PDF and send them to the AI provider for conversion.
4.  **Read**: Once processed, the Markdown content will appear in the main view. You can switch between files in the sidebar history.

## Notes

- This app runs entirely in the browser.
- API requests are made directly from the browser to OpenAI/Anthropic. Ensure your network allows this or use a proxy if needed (Anthropic may require CORS handling).
- PDF processing is done by converting pages to images and using Vision capabilities of LLMs.

## License

MIT
