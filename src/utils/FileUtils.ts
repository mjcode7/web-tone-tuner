export class FileUtils {
  public static async objectUrlToBlob(url: string): Promise<Blob> {
    return fetch(url).then(r => r.blob());
  }

  /**
   * Removes an extension (if there is one).
   * myfile.jpeg -> myfile
   * myfile -> myfile
   * some.file.extension -> some.file
   */
  public static removeExtension(filename: string): string {
    return filename.substr(0, filename.lastIndexOf('.')) || filename;
  }
}
