import { useCallback } from 'react';
import { useFileStore } from './useFileStore';
import { useKeyPoolStore } from '../KeyPool/useKeyPoolStore';
import { PDFPageImage } from '../FileParser/PDFProcessor';
import { processImageWithGLM } from '../../lib/glm';
import { saveFile } from '../../lib/storage';

const WAIT_TIME_ON_ALL_KEYS_LIMITED = 5000; // 5 seconds

export const usePDFProcessing = () => {
  const { addFile, setProcessing, updateFileContent } = useFileStore();
  const { getNextKey, markRateLimited } = useKeyPoolStore();

  const processPDF = useCallback(async (file: File) => {
    // Helper function inside useCallback to avoid dependency issues
    const processPageWithRetry = async (
      image: PDFPageImage, 
      retryCount = 0
    ): Promise<string> => {
      if (retryCount > 5) {
        throw new Error(`Failed to process page ${image.pageNumber} after multiple retries.`);
      }

      // Get a GLM key
      let keyData = getNextKey('glm');
      
      if (!keyData) {
          // Wait and retry if it might be due to rate limits
          await new Promise(resolve => setTimeout(resolve, WAIT_TIME_ON_ALL_KEYS_LIMITED));
          keyData = getNextKey('glm');
          if (!keyData) {
              throw new Error('No available GLM API Keys. Please add keys or wait for cooldown.');
          }
      }

      const { content, error, isRateLimit } = await processImageWithGLM(keyData.key, image.dataUrl);

      if (isRateLimit) {
        markRateLimited(keyData.id);
        console.warn(`Key ${keyData.id} rate limited. Switching...`);
        return processPageWithRetry(image, retryCount + 1);
      }

      if (error) {
        console.error(`Error on page ${image.pageNumber}: ${error}`);
        if (retryCount < 2) {
           return processPageWithRetry(image, retryCount + 1);
        }
        return `\n\n> **Error processing Page ${image.pageNumber}**: ${error}\n\n`;
      }

      return content;
    };

    // Check for keys first
    const initialKey = getNextKey('glm');
    if (!initialKey) {
      alert('请先配置 GLM API Key (Please configure GLM API Key first)');
      return;
    }

    const fileId = crypto.randomUUID();
    const newFile = {
      id: fileId,
      name: file.name,
      content: '', 
      createdAt: Date.now(),
    };

    addFile(newFile);
    setProcessing(true, '正在解析 PDF (Parsing PDF)...');

    try {
      // 1. Extract Images
      // To save memory, we could extract one by one, but extractImagesFromPDF currently does all.
      // For "queue processing", we should probably change extractImagesFromPDF to be a generator or just use it as is if files aren't massive.
      // Optimization: For now, I'll stick to extracting all images first (as implemented in PDFProcessor) 
      // but if the user uploads a huge book, this will crash.
      // Better approach: Extract page count first, then loop and extract one page -> process -> garbage collect.
      
      // Let's modify the flow to NOT load all images at once.
      // I'll need to use pdfjs directly here or modify PDFProcessor. 
      // I will assume PDFProcessor's extractImagesFromPDF returns all. 
      // Let's use a smarter loop here.
      
      const pdf = await import('../FileParser/PDFProcessor').then(m => m.loadPDF(file));
      const numPages = pdf.numPages;
      let fullContent = '';

      for (let i = 1; i <= numPages; i++) {
        setProcessing(true, `正在处理第 ${i}/${numPages} 页 (Processing page ${i}/${numPages})...`);
        
        // Extract single page image
        const dataUrl = await import('../FileParser/PDFProcessor').then(m => m.convertPageToImage(pdf, i));
        
        // Process with AI
        const pageContent = await processPageWithRetry({ pageNumber: i, dataUrl });
        
        const pageMarkdown = `\n\n<!-- Page ${i} -->\n${pageContent}`;
        fullContent += pageMarkdown;
        
        // Update store incrementally
        updateFileContent(fileId, fullContent);
        
        // Save intermediate result to DB (optional, but good for crash recovery)
        // await saveFile({ ...newFile, content: fullContent, updatedAt: Date.now() }); 
      }
      
      // Final save
      await saveFile({
        ...newFile,
        content: fullContent,
        updatedAt: Date.now(),
      });
      
      setProcessing(false);
      
    } catch (error: any) {
      console.error('Processing failed:', error);
      setProcessing(false);
      alert(`处理失败 (Processing failed): ${error.message}`);
    }
  }, [addFile, setProcessing, updateFileContent, getNextKey, markRateLimited]);

  return { processPDF };
};
