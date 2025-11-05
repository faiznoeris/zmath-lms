/**
 * Detect material type from uploaded file
 * @param file - File object to analyze
 * @returns Material type: 'video' or 'document'
 */
export function detectMaterialType(file: File): "video" | "document" {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Check for document types
  if (
    fileType.includes('pdf') ||
    fileType.includes('document') ||
    fileType.includes('msword') ||
    fileType.includes('wordprocessingml') ||
    fileType.includes('presentation') ||
    fileType.includes('ms-powerpoint') ||
    fileType.includes('presentationml') ||
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx')
  ) {
    return 'document';
  }
  
  // Default to document if unclear
  return 'document';
}

/**
 * Get material type color for MUI Chip
 * @param type - Material type
 * @returns MUI color variant
 */
export function getMaterialTypeColor(type: string): "primary" | "secondary" | "success" | "info" | "default" {
  switch (type) {
    case "video":
      return "primary";
    case "document":
      return "secondary";
    case "interactive":
      return "success";
    case "image":
      return "info";
    default:
      return "default";
  }
}

/**
 * Get material type label
 * @param type - Material type
 * @returns Human-readable label
 */
export function getMaterialTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    video: "Video",
    document: "Document",
    interactive: "Interactive",
    image: "Image",
  };
  return labels[type] || type;
}
