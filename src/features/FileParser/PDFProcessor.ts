import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// Use the exact version from node_modules or a more stable CDN
// pdfjs-dist 5.x has breaking changes and uses mjs workers.
// The most reliable way in Vite is to import the worker URL directly if possible, or use unpkg.
// Note: worker.min.mjs is needed for module support in modern browsers/bundlers for v3+
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFPageImage {
  pageNumber: number;
  dataUrl: string;
}

export const loadPDF = async (file: File): Promise<pdfjsLib.PDFDocumentProxy> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  return loadingTask.promise;
};

export const convertPageToImage = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1.5
): Promise<string> => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Canvas context not available');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
  
  // Use lower quality to reduce base64 size (GLM has size limits)
  return canvas.toDataURL('image/jpeg', 0.6);
};

export const extractImagesFromPDF = async (
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PDFPageImage[]> => {
  const pdf = await loadPDF(file);
  const numPages = pdf.numPages;
  const images: PDFPageImage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const dataUrl = await convertPageToImage(pdf, i);
    images.push({ pageNumber: i, dataUrl });
    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return images;
};
