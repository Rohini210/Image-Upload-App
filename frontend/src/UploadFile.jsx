import { useRef, useState } from "react";
import API from "./api";

function UploadFile() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);

  const isImageFile = (file) =>
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp|bmp|svg|ico|heic|heif)$/i.test(file.name);

  const uploadFiles = async (fileList) => {
    if (!fileList?.length) return;

    const images = Array.from(fileList).filter(isImageFile);
    if (!images.length) {
      alert("No image files found in the selection.");
      return;
    }

    const formData = new FormData();
    for (const file of images) {
      const uploadName =
        file.webkitRelativePath?.replace(/\\/g, "/") || file.name;
      formData.append("files", file, uploadName);
    }

    setUploading(true);
    setShowPicker(false);
    try {
      const { data } = await API.post("/upload", formData);
      const skipped = data.skipped ? ` (${data.skipped} non-images skipped)` : "";
      alert(`Uploaded ${data.count} file(s) successfully.${skipped}`);
    } catch (error) {
      console.error(error);
      alert("Error uploading files.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleChange = (e) => {
    uploadFiles(e.target.files);
  };

  return (
    <section className="home-panel">
      <h1>Upload Images</h1>
      <p className="home-subtitle">
        Upload one or more images, or an entire folder.
      </p>

      <div className="upload-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowPicker((open) => !open)}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload files or folder"}
        </button>

        {showPicker && !uploading && (
          <div className="picker-menu">
            <button
              type="button"
              className="picker-option"
              onClick={() => fileInputRef.current?.click()}
            >
              Select files
            </button>
            <button
              type="button"
              className="picker-option"
              onClick={() => folderInputRef.current?.click()}
            >
              Select folder
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          hidden
          onChange={handleChange}
        />
      </div>
    </section>
  );
}

export default UploadFile;
