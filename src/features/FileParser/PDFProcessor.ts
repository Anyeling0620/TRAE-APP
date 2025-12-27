import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// Note: In a real Vite app, this might need to be handled differently (e.g., copying the worker file)
// For now, we use the CDN or try to rely on the installed package if configured correctly in Vite
// A common workaround for Vite is importing the worker script URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  scale = 2.0
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
  
  return canvas.toDataURL('image/jpeg', 0.8);
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
