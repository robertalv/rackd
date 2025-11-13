import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { c as cn, B as Button } from "./router-CozkPsbM.js";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { UploadIcon, X, Image } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useMutation, useAction, useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Root,
    {
      "data-slot": "progress",
      className: cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ProgressPrimitive.Indicator,
        {
          "data-slot": "progress-indicator",
          className: "bg-primary h-full w-full flex-1 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}
const renderBytes = (bytes) => {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)}${units[unitIndex]}`;
};
const DropzoneContext = createContext(
  void 0
);
const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message;
        onError?.(new Error(message));
        return;
      }
      onDrop?.(acceptedFiles, fileRejections, event);
    },
    ...props
  });
  return /* @__PURE__ */ jsx(
    DropzoneContext.Provider,
    {
      value: { src, accept, maxSize, minSize, maxFiles },
      children: /* @__PURE__ */ jsxs(
        Button,
        {
          className: cn(
            "relative h-auto w-full flex-col overflow-hidden p-8",
            isDragActive && "outline-none ring-1 ring-ring",
            className
          ),
          disabled,
          type: "button",
          variant: "outline",
          ...getRootProps(),
          children: [
            /* @__PURE__ */ jsx("input", { ...getInputProps(), disabled }),
            children
          ]
        }
      )
    },
    JSON.stringify(src)
  );
};
const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone");
  }
  return context;
};
const maxLabelItems = 3;
const DropzoneContent = ({
  children,
  className
}) => {
  const { src } = useDropzoneContext();
  if (!src) {
    return null;
  }
  if (children) {
    return children;
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center", className), children: [
    /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground", children: /* @__PURE__ */ jsx(UploadIcon, { size: 16 }) }),
    /* @__PURE__ */ jsx("p", { className: "my-2 w-full truncate font-medium text-sm", children: src.length > maxLabelItems ? `${new Intl.ListFormat("en").format(
      src.slice(0, maxLabelItems).map((file) => file.name)
    )} and ${src.length - maxLabelItems} more` : new Intl.ListFormat("en").format(src.map((file) => file.name)) }),
    /* @__PURE__ */ jsx("p", { className: "w-full text-wrap text-muted-foreground text-xs", children: "Drag and drop or click to replace" })
  ] });
};
const DropzoneEmptyState = ({
  children,
  className
}) => {
  const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext();
  if (src) {
    return null;
  }
  if (children) {
    return children;
  }
  let caption = "";
  if (accept) {
    caption += "Accepts ";
    caption += new Intl.ListFormat("en").format(Object.keys(accept));
  }
  if (minSize && maxSize) {
    caption += ` between ${renderBytes(minSize)} and ${renderBytes(maxSize)}`;
  } else if (minSize) {
    caption += ` at least ${renderBytes(minSize)}`;
  } else if (maxSize) {
    caption += ` less than ${renderBytes(maxSize)}`;
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center justify-center", className), children: [
    /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground", children: /* @__PURE__ */ jsx(UploadIcon, { size: 16 }) }),
    /* @__PURE__ */ jsxs("p", { className: "my-2 w-full truncate text-wrap font-medium text-sm", children: [
      "Upload ",
      maxFiles === 1 ? "a file" : "files"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "w-full truncate text-wrap text-muted-foreground text-xs", children: "Drag and drop or click to upload" }),
    caption && /* @__PURE__ */ jsxs("p", { className: "text-wrap text-muted-foreground text-xs", children: [
      caption,
      "."
    ] })
  ] });
};
function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFileByStorageId = useMutation(api.files.deleteFileByStorageId);
  const processImageUpload = useAction(api.files.processImageUpload);
  const uploadFile = async (file, _options = {}) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(25);
      const result = await fetch(uploadUrl, {
        method: "POST",
        body: file
      });
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }
      const { storageId } = await result.json();
      setUploadProgress(75);
      let url = storageId;
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        try {
          const processed = await processImageUpload({ storageId });
          url = processed.displayUrl;
          setUploadProgress(100);
        } catch (error) {
          console.error("Failed to process image:", error);
          setUploadProgress(100);
        }
      } else {
        setUploadProgress(100);
      }
      return {
        storageId,
        url
      };
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  const uploadFiles = async (files, options = {}) => {
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i], options);
      results.push(result);
    }
    return results;
  };
  const deleteFileFromStorage = async (storageId) => {
    try {
      await deleteFileByStorageId({ storageId });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  };
  return {
    uploadFile,
    uploadFiles,
    deleteFileFromStorage,
    isUploading,
    uploadProgress
  };
}
function VenueImageUpload({
  onUpload,
  onDelete,
  onError,
  className,
  currentUrl,
  currentStorageId
}) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedStorageId, setUploadedStorageId] = useState(null);
  const { uploadFile, deleteFileFromStorage, isUploading, uploadProgress } = useFileUpload();
  const uploadedImageUrl = useQuery(
    api.files.getFileUrl,
    uploadedStorageId ? { storageId: uploadedStorageId } : "skip"
  );
  const currentImageUrl = useQuery(
    api.files.getFileUrl,
    currentStorageId ? { storageId: currentStorageId } : "skip"
  );
  const handleDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadedFiles([file]);
    try {
      const result = await uploadFile(file, {
        category: "venue_image",
        description: "Venue image"
      });
      setUploadedStorageId(result.storageId);
      onUpload?.(result.storageId);
    } catch (error) {
      console.error("Upload failed:", error);
      onError?.(error);
      setUploadedFiles([]);
      setUploadedStorageId(null);
    }
  };
  const removeFile = async () => {
    try {
      if (uploadedStorageId) {
        await deleteFileFromStorage(uploadedStorageId);
        setUploadedFiles([]);
        setUploadedStorageId(null);
      } else if (currentStorageId) {
        await deleteFileFromStorage(currentStorageId);
        onDelete?.();
      } else {
        setUploadedFiles([]);
        setUploadedStorageId(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      onError?.(error);
    }
  };
  const displayUrl = uploadedImageUrl || currentImageUrl || currentUrl;
  const hasFiles = uploadedFiles.length > 0 || displayUrl;
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-4", className), children: [
    isUploading && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
        /* @__PURE__ */ jsx("span", { children: "Uploading venue image..." }),
        /* @__PURE__ */ jsxs("span", { children: [
          uploadProgress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Progress, { value: uploadProgress, className: "w-full" })
    ] }),
    displayUrl && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "border rounded-lg overflow-hidden bg-gray-50", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: displayUrl,
          alt: "Venue image",
          className: "w-full h-64 object-cover"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: "destructive",
          onClick: removeFile,
          disabled: isUploading,
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      ) }),
      uploadedFiles[0] && /* @__PURE__ */ jsx("div", { className: "mt-2 p-3 bg-muted rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Image, { className: "h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: uploadedFiles[0].name }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "(",
          (uploadedFiles[0].size / 1024 / 1024).toFixed(2),
          " MB)"
        ] }),
        uploadedImageUrl && /* @__PURE__ */ jsx("span", { className: "text-xs text-green-600", children: "• Uploaded" })
      ] }) })
    ] }),
    !hasFiles && /* @__PURE__ */ jsxs(
      Dropzone,
      {
        src: uploadedFiles,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".heif"] },
        maxSize: 10 * 1024 * 1024,
        maxFiles: 1,
        onDrop: handleDrop,
        onError,
        disabled: isUploading,
        children: [
          /* @__PURE__ */ jsx(DropzoneContent, { children: uploadedFiles.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground", children: /* @__PURE__ */ jsx(Image, { size: 16 }) }),
            /* @__PURE__ */ jsx("p", { className: "my-2 w-full truncate font-medium text-sm", children: uploadedFiles[0]?.name }),
            /* @__PURE__ */ jsx("p", { className: "w-full text-wrap text-muted-foreground text-xs", children: "Drag and drop or click to replace" })
          ] }) : null }),
          /* @__PURE__ */ jsx(DropzoneEmptyState, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground", children: /* @__PURE__ */ jsx(Image, { size: 16 }) }),
            /* @__PURE__ */ jsx("p", { className: "my-2 w-full truncate text-wrap font-medium text-sm", children: "Upload venue image" }),
            /* @__PURE__ */ jsx("p", { className: "w-full truncate text-wrap text-muted-foreground text-xs", children: "Drag and drop or click to upload" }),
            /* @__PURE__ */ jsx("p", { className: "text-wrap text-muted-foreground text-xs", children: "PNG, JPG, GIF, WebP up to 10MB" })
          ] }) })
        ]
      }
    )
  ] });
}
export {
  Dropzone as D,
  Progress as P,
  VenueImageUpload as V,
  DropzoneContent as a,
  DropzoneEmptyState as b,
  useFileUpload as u
};
