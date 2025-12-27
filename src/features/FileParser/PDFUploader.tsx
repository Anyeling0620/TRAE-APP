import React, { useCallback, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('请上传有效的 PDF 文件 (Please upload a valid PDF file).');
      }
    }
  }, [onFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
        isProcessing && "pointer-events-none opacity-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-2">
        {isProcessing ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" />
        )}
        <h3 className="font-semibold text-lg">
          {isProcessing ? '正在处理 PDF...' : '上传 PDF'}
        </h3>
        <p className="text-sm text-muted-foreground">
          拖拽文件到此处或点击选择 PDF
        </p>
      </div>
    </div>
  );
};
