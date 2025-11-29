"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  type: "photo" | "video";
  onUpload: (urls: string[]) => void;
  existingFiles?: string[];
  onRemove?: (url: string) => void;
  maxSize?: number; // в MB
}

export function FileUploader({
  accept,
  multiple = false,
  type,
  onUpload,
  existingFiles = [],
  onRemove,
  maxSize = 50,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Файл "${file.name}" слишком большой. Максимальный размер: ${maxSize}MB`;
    }
    return null;
  };

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Валидация
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setTimeout(() => setErrors([]), 5000);
    }

    if (validFiles.length === 0) return;

    // Создаем превью для изображений
    const previews = await Promise.all(
      validFiles.map(async (file) => {
        if (type === "photo" && file.type.startsWith("image/")) {
          const preview = URL.createObjectURL(file);
          return { file, preview };
        }
        return { file, preview: "" };
      })
    );

    setPreviewFiles((prev) => [...prev, ...previews]);
    setUploading(true);

    // Загружаем файлы
    const uploadedUrls: string[] = [];
    const progress: { [key: string]: number } = {};

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileId = `${file.name}-${Date.now()}-${i}`;
        progress[fileId] = 0;
        setUploadProgress({ ...progress });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        try {
          const xhr = new XMLHttpRequest();

          // Отслеживаем прогресс
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              progress[fileId] = Math.round(percentComplete);
              setUploadProgress({ ...progress });
            }
          });

          const uploadPromise = new Promise<string>((resolve, reject) => {
            xhr.addEventListener("load", () => {
              if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response.url);
              } else {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.error || "Ошибка загрузки"));
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Ошибка сети"));
            });

            xhr.open("POST", "/api/upload");
            xhr.send(formData);
          });

          const url = await uploadPromise;
          uploadedUrls.push(url);
          progress[fileId] = 100;
          setUploadProgress({ ...progress });
        } catch (error: any) {
          console.error(`Ошибка загрузки ${file.name}:`, error);
          setErrors((prev) => [...prev, `Ошибка загрузки "${file.name}": ${error.message}`]);
        }
      }

      if (uploadedUrls.length > 0) {
        onUpload(uploadedUrls);
      }
    } catch (error: any) {
      setErrors((prev) => [...prev, error.message]);
    } finally {
      setUploading(false);
      setPreviewFiles([]);
      setUploadProgress({});
      setTimeout(() => setErrors([]), 5000);
    }
  }, [type, maxSize, onUpload]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await processFiles(files);
      // Сбрасываем input чтобы можно было выбрать тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const handleRemoveExisting = (url: string) => {
    if (onRemove) {
      onRemove(url);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getAcceptTypes = () => {
    if (accept) return accept;
    return type === "photo" ? "image/*" : "video/*";
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    
    const input = fileInputRef.current;
    if (input) {
      input.disabled = false;
      // Прямой вызов click
      input.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input - скрыт но доступен */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        multiple={multiple}
        onChange={handleFileSelect}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
          opacity: 0,
          pointerEvents: 'none'
        }}
        disabled={uploading}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !uploading) {
            handleButtonClick(e as any);
          }
        }}
        className={`
          relative cursor-pointer rounded-[20px] border-2 border-dashed p-8 text-center transition-all
          ${
            isDragging
              ? "border-[#475C8C] bg-[#475C8C]/10"
              : "border-[#475C8C]/30 bg-gradient-to-br from-white to-[#eff2ff] hover:border-[#475C8C]/50 hover:bg-[#475C8C]/5"
          }
          ${uploading ? "pointer-events-none opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="size-12 animate-spin text-[#475C8C]" />
              <div className="space-y-2">
                <p className="text-base font-medium text-[#121420]">Загрузка файлов...</p>
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="w-full max-w-xs space-y-1">
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                      <div key={fileId} className="space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#475C8C]/20">
                          <div
                            className="h-full bg-[#475C8C] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#4a4e65]">{progress}%</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-[#475C8C]/10 p-4">
                {type === "photo" ? (
                  <ImageIcon className="size-8 text-[#475C8C]" />
                ) : (
                  <Video className="size-8 text-[#475C8C]" />
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-[#121420]">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="mt-1 text-sm text-[#4a4e65]">
                  {type === "photo"
                    ? "Поддерживаются: JPEG, PNG, WebP, GIF (макс. 50MB)"
                    : "Поддерживаются: MP4, WebM, OGG (макс. 50MB)"}
                </p>
                {multiple && (
                  <p className="mt-1 text-xs text-[#4a4e65]">Можно выбрать несколько файлов</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Кнопка выбора файлов */}
      {!uploading && (
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full rounded-full bg-[#475C8C] px-6 py-3 text-sm font-medium text-white hover:bg-[#475C8C]/90 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Upload className="size-4" />
          Выбрать файлы
        </button>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-[16px] bg-red-50 p-4">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Preview Files (before upload) */}
      {previewFiles.length > 0 && !uploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#121420]">Файлы к загрузке:</p>
          <div className="grid grid-cols-3 gap-2">
            {previewFiles.map((preview, index) => (
              <div key={index} className="group relative">
                {preview.preview ? (
                  <img
                    src={preview.preview}
                    alt={preview.file.name}
                    className="h-24 w-full rounded-[12px] object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-[12px] bg-[#475C8C]/10">
                    <Video className="size-8 text-[#475C8C]" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePreview(index);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
                <p className="mt-1 truncate text-xs text-[#4a4e65]">{preview.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#121420]">
            Загруженные файлы ({existingFiles.length}):
          </p>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
            {existingFiles.map((url, index) => (
              <div key={index} className="group relative">
                {type === "photo" ? (
                  <img
                    src={url}
                    alt={`File ${index + 1}`}
                    className="h-24 w-full rounded-[12px] object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-[12px] bg-[#475C8C]/10">
                    <Video className="size-8 text-[#475C8C]" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(url)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
                {type === "video" && (
                  <p className="mt-1 truncate text-xs text-[#4a4e65]">
                    {url.includes("youtube") || url.includes("vimeo") ? "Видео" : "Видео файл"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
