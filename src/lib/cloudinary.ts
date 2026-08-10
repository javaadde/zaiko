type UploadAsset = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

type UploadOptions = {
  publicId: string;
  folder?: string;
};

function getCloudinaryConfig() {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }

  return { cloudName, uploadPreset };
}

function getFileName(asset: UploadAsset) {
  if (asset.fileName?.trim()) return asset.fileName.trim();
  const extension = asset.mimeType?.split('/')[1] ?? 'jpg';
  return `upload.${extension}`;
}

export async function uploadImageToCloudinary(asset: UploadAsset, options: UploadOptions) {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  const fileResponse = await fetch(asset.uri);
  const fileBlob = await fileResponse.blob();

  const formData = new FormData();
  formData.append('file', fileBlob, getFileName(asset));
  formData.append('upload_preset', uploadPreset);
  formData.append('public_id', options.publicId);
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Cloudinary upload failed');
  }

  return {
    url: payload.secure_url as string,
    path: payload.public_id as string,
  };
}
