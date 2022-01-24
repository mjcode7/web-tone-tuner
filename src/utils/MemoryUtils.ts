export const revokeObjectUrl = (oldUrl?: string) => {
  if (!oldUrl) return;
  window.URL.revokeObjectURL(oldUrl);
};
