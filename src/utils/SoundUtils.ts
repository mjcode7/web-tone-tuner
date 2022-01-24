export class SoundUtils {
  public static floatArraysToArrayBuffers(floatArrays: Float32Array[]): ArrayBuffer[] {
    return floatArrays.map((data) => data.buffer);
  }

  public static arrayBuffersToFloatArrays(arrayBuffers: ArrayBuffer[]): Float32Array[] {
    return arrayBuffers.map((buffer) => new Float32Array(buffer));
  }

  public static arrayBuffersToInt8Arrays(arrayBuffers: ArrayBuffer[]): Int8Array[] {
    return arrayBuffers.map((buffer) => new Int8Array(buffer));
  }
}
