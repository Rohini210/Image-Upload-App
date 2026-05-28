import { useState } from "react";
import API from "./api";

const API_BASE = "http://localhost:8000";

function AdminPanel() {
  const [images, setImages] = useState([]);
  const [listed, setListed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleListImages = async () => {
    setLoading(true);
    try {
      const response = await API.get("/images");
      setImages(response.data);
      setListed(true);
    } catch (error) {
      console.error(error);
      alert("Could not load images.");
    } finally {
      setLoading(false);
    }
  };

  const rows = [];
  for (let i = 0; i < images.length; i += 6) {
    rows.push(images.slice(i, i + 6));
  }

  return (
    <section className="admin-panel">
      <h1>Admin Panel</h1>
      <button
        type="button"
        className="btn-primary"
        onClick={handleListImages}
        disabled={loading}
      >
        {loading ? "Loading…" : "List images"}
      </button>

      {listed && images.length === 0 && (
        <p className="empty-message">No images uploaded yet.</p>
      )}

      {listed && images.length > 0 && (
        <div className="image-gallery">
          {rows.map((row, rowIndex) => (
            <div className="image-row" key={`row-${rowIndex}`}>
              {row.map((image) => (
                <article className="image-card" key={image.id}>
                  <img
                    src={`${API_BASE}/${image.filepath}`}
                    alt={image.filename}
                  />
                  <h4>{image.display_name || image.filename}</h4>
                  <p>{new Date(image.uploaded_at).toLocaleString()}</p>
                </article>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminPanel;
