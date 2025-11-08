// Date formatting utilities
export { formatDate, formatDateShort } from "./dateFormat";

// YouTube utilities
export { getYouTubeVideoId, formatYouTubeUrl, isYouTubeUrl } from "./youtube";

// Material utilities
export { detectMaterialType, getMaterialTypeColor, getMaterialTypeLabel } from "./materialHelpers";

// Quiz utilities
export { getResultStatus, calculateScorePercentage } from "./quizHelpers";

// Image upload utilities
export { uploadImage, createPasteHandler } from "./imageUpload";
export type { ImageUploadResult } from "./imageUpload";

// Other existing utilities
export * from "./auth";
export * from "./stringAvatar";
export * from "./stringToColor";
// export * from "./validators";
