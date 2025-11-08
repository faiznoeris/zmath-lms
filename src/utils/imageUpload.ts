import { createClient } from "./supabase/client";

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - The folder path in storage (e.g., 'questions/question' or 'questions/option')
 * @returns Upload result with public URL if successful
 */
export async function uploadImage(
  file: File,
  folder: string
): Promise<ImageUploadResult> {
  try {
    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("lms")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("lms").getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle paste event to detect and upload images
 * @param event - ClipboardEvent from paste
 * @param folder - Target folder for upload
 * @param onSuccess - Callback with markdown image syntax
 * @param onError - Callback for errors
 */
export async function handleImagePaste(
  event: ClipboardEvent,
  folder: string,
  onSuccess: (markdown: string) => void,
  onError: (error: string) => void
): Promise<void> {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Check if the item is an image
    if (item.type.indexOf("image") !== -1) {
      event.preventDefault(); // Prevent default paste behavior

      const file = item.getAsFile();
      if (!file) continue;

      // Show uploading state (you might want to add a loading indicator)
      const result = await uploadImage(file, folder);

      if (result.success && result.url) {
        // Insert markdown image syntax
        const markdown = `![image](${result.url})`;
        onSuccess(markdown);
      } else {
        onError(result.error || "Failed to upload image");
      }

      break; // Only handle the first image
    }
  }
}

/**
 * Create a paste event handler for a text field
 * @param folder - Target folder for upload ('questions/question' or 'questions/option')
 * @param currentValue - Current value of the text field
 * @param onChange - Function to update the field value
 * @param onError - Callback for errors
 */
export function createPasteHandler(
  folder: string,
  currentValue: string,
  onChange: (value: string) => void,
  onError: (error: string) => void
) {
  return async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardEvent = event.nativeEvent as ClipboardEvent;
    const items = clipboardEvent.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf("image") !== -1) {
        event.preventDefault();

        const file = item.getAsFile();
        if (!file) continue;

        const result = await uploadImage(file, folder);

        if (result.success && result.url) {
          // Get cursor position (selection)
          const target = event.target as HTMLTextAreaElement | HTMLInputElement;
          const start = target.selectionStart || currentValue.length;
          const end = target.selectionEnd || currentValue.length;

          // Insert markdown at cursor position
          const markdown = `![image](${result.url})`;
          const newValue =
            currentValue.substring(0, start) +
            markdown +
            currentValue.substring(end);

          onChange(newValue);

          // Set cursor position after the inserted markdown
          setTimeout(() => {
            target.selectionStart = start + markdown.length;
            target.selectionEnd = start + markdown.length;
          }, 0);
        } else {
          onError(result.error || "Failed to upload image");
        }

        break;
      }
    }
  };
}
