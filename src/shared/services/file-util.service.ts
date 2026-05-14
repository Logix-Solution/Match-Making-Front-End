import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileUtilService {

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || '';
  }
}
