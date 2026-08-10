import { getApp } from '@react-native-firebase/app';
import { getDownloadURL, getStorage, putFile, ref as storageRef } from '@react-native-firebase/storage';

const firebaseApp = getApp();
const storage = getStorage(firebaseApp);

export async function uploadCompanyLogo(companyId: string, uri: string) {
  const path = `company-logos/${companyId}`;
  const ref = storageRef(storage, path);
  await putFile(ref, uri);
  const logoUrl = await getDownloadURL(ref);
  return { logoUrl, logoPath: path };
}
