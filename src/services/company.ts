import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function uploadCompanyLogo(companyId: string, asset: { uri: string; mimeType?: string | null; fileName?: string | null }) {
  const path = `${companyId}/logo_${Date.now()}`;
  const upload = await uploadImageToCloudinary(asset, {
    folder: 'company-logos',
    publicId: path,
  });
  return { logoUrl: upload.url, logoPath: upload.path };
}
