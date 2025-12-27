import React, { useEffect } from 'react';
import { useFileStore } from './useFileStore';
import { usePDFProcessing } from './usePDFProcessing';
import { getFiles, deleteFile } from '../../lib/storage';
import { PDFUploader } from '../FileParser/PDFUploader';
import { MarkdownViewer } from './MarkdownViewer';
import { KeyPoolConfig } from '../KeyPool/KeyPoolConfig';
import { KeyStatusMonitor } from '../KeyPool/KeyStatusMonitor';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from '../../components/ui/primitives';
import { Separator } from '../../components/ui/separator';
import { FileText, Trash2, Menu, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ReaderLayout = () => {
  const { files, activeFileId, setFiles, selectFile, removeFile, isProcessing, progress } = useFileStore();
  const { processPDF } = usePDFProcessing();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Load files from DB on mount
  useEffect(() => {
    const load = async () => {
      const storedFiles = await getFiles();
      // Sort by date desc
      storedFiles.sort((a, b) => b.updatedAt - a.updatedAt);
      setFiles(storedFiles.map(f => ({
        id: f.id,
        name: f.name,
        content: f.content,
        createdAt: f.createdAt
      })));
    };
    load();
  }, [setFiles]);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除此文件吗？ (Are you sure you want to delete this file?)')) {
      await deleteFile(id);
      removeFile(id);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar */}
      <div 
        className={cn(
          "flex flex-col border-r bg-muted/20 transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <BookOpen className="h-5 w-5" />
            <span>Smart MD</span>
          </div>
          <KeyPoolConfig />
        </div>
        
        <div className="p-4">
          <PDFUploader onFileSelect={processPDF} isProcessing={isProcessing} />
          {isProcessing && (
            <div className="mt-2 text-xs text-center text-muted-foreground animate-pulse">
              {progress}
            </div>
          )}
          
          <KeyStatusMonitor />
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">历史记录 (History)</h4>
            {files.length === 0 && !isProcessing && (
              <div className="text-sm text-muted-foreground text-center py-4">
                暂无文件 (No files yet)
              </div>
            )}
            {files.map(file => (
              <div
                key={file.id}
                onClick={() => selectFile(file.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors text-sm border",
                  activeFileId === file.id 
                    ? "bg-accent text-accent-foreground border-primary/20" 
                    : "hover:bg-accent/50 border-transparent"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={(e) => handleDelete(e, file.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-medium truncate">
              {activeFile ? activeFile.name : '请选择或上传文件 (Select or upload a file)'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Toolbar actions could go here */}
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {activeFile ? (
            <MarkdownViewer content={activeFile.content} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p>从左侧选择文件或上传新的 PDF (Select a file from the sidebar or upload a new PDF)</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
