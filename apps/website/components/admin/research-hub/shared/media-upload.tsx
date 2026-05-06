"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileIcon, isImageFile, isVideoFile, isAudioFile } from "@/lib/admin/research-hub/utils";

interface MediaUploadProps {
  onFilesSelected?: (files: File[]) => void;
  onFileUploaded?: (file: UploadedFile) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: (id: string) => void;
  onPreview?: (file: UploadedFile) => void;
  showActions?: boolean;
}

function FilePreview({ file, onRemove, onPreview, showActions = true }: FilePreviewProps) {
  const getFileIcon = (mimeType: string) => {
    if (isImageFile(mimeType)) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (isVideoFile(mimeType)) return <Video className="w-8 h-8 text-purple-500" />;
    if (isAudioFile(mimeType)) return <Music className="w-8 h-8 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "p-4 border-2 transition-all duration-200",
      file.status === 'error' && "border-red-200 bg-red-50",
      file.status === 'completed' && "border-green-200 bg-green-50",
      file.status === 'uploading' && "border-blue-200 bg-blue-50"
    )}>
      <div className="flex items-start gap-4">
        {/* File Icon/Preview */}
        <div className="flex-shrink-0">
          {isImageFile(file.type) && file.url ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {file.type}
              </p>
              
              {file.error && (
                <p className="text-xs text-red-600 mt-1">{file.error}</p>
              )}
              
              {file.status === 'uploading' && file.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={file.progress} className="h-1" />
                  <p className="text-xs text-gray-500 mt-1">{file.progress}%</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-2">
              {getStatusIcon()}
              
              {showActions && file.status === 'completed' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview?.(file)}
                    className="p-1 h-6 w-6"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove?.(file.id)}
                    className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {showActions && file.status === 'error' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove?.(file.id)}
                  className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MediaUpload({
  onFilesSelected,
  onFileUploaded,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  multiple = true,
  className,
  disabled = false
}: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file count
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name} is too large (max ${formatFileSize(maxFileSize)})`);
        return;
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -2));
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const simulateUpload = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
        progress: 0
      };

      // Add to uploaded files immediately
      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          uploadedFile.status = 'completed';
          uploadedFile.progress = 100;
          setUploadedFiles(prev => 
            prev.map(f => f.id === uploadedFile.id ? uploadedFile : f)
          );
          
          onFileUploaded?.(uploadedFile);
          resolve(uploadedFile);
        } else {
          uploadedFile.progress = Math.round(progress);
          setUploadedFiles(prev => 
            prev.map(f => f.id === uploadedFile.id ? uploadedFile : f)
          );
        }
      }, 200);
    });
  };

  const handleFiles = async (files: FileList) => {
    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    onFilesSelected?.(validFiles);

    try {
      // Upload files in parallel
      const uploadPromises = validFiles.map(file => simulateUpload(file));
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, uploading]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handlePreviewFile = (file: UploadedFile) => {
    if (isImageFile(file.type) || isVideoFile(file.type)) {
      window.open(file.url, '_blank');
    } else {
      // For other files, trigger download
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "p-8 border-2 border-dashed transition-all duration-200 cursor-pointer",
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          (disabled || uploading) && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4",
            dragActive ? "text-blue-500" : "text-gray-400"
          )} />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {uploading ? 'Uploading files...' : 'Upload files'}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to select
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
            <Badge variant="outline">Max {maxFiles} files</Badge>
            <Badge variant="outline">Max {formatFileSize(maxFileSize)}</Badge>
            {acceptedTypes.map((type, index) => (
              <Badge key={index} variant="outline">
                {type.replace('*', 'files')}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          
          <div className="grid gap-3">
            {uploadedFiles.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={handleRemoveFile}
                onPreview={handlePreviewFile}
              />
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadedFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Image Gallery Component
export function ImageGallery({
  images,
  onAdd,
  onRemove,
  onReorder,
  maxImages = 10
}: {
  images: string[];
  onAdd?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  maxImages?: number;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorder) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Image Gallery ({images.length}/{maxImages})
        </h3>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Add Images
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-move"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
            />
            
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                onClick={() => onRemove(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {images.length < maxImages && onAdd && (
          <div
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && onAdd) {
            onAdd(Array.from(files));
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
