import { ArrowLeftIcon, FileTextIcon, ImageIcon, SaveIcon, XIcon, TypeIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useUploadImages } from "../hooks/useProducts";

function EditProductForm({ product, isPending, isError, onSubmit }) {
  const uploadImages = useUploadImages();

  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
  });

  const [existingImages, setExistingImages] = useState<string[]>(product.imageUrls || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);

      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingImages.length === 0 && newFiles.length === 0) {
      alert("Please have at least one image");
      return;
    }

    try {
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadData = new FormData();
        newFiles.forEach((file) => uploadData.append("images", file));

        const uploadResult = await uploadImages.mutateAsync(uploadData);
        uploadedUrls = uploadResult.data;
      }

      const allImageUrls = [...existingImages, ...uploadedUrls];
      onSubmit({ ...formData, imageUrls: allImageUrls });
    } catch (error) {
      console.error("Error uploading new images:", error);
    }
  };

  const isFormPending = isPending || uploadImages.isPending;

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/profile" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeftIcon className="size-4" /> Back
      </Link>

      <div className="card bg-base-300">
        <div className="card-body">
          <h1 className="card-title">
            <SaveIcon className="size-5 text-primary" />
            Edit Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <TypeIcon className="size-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Product title"
                className="grow"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </label>

            {/* IMAGES INPUT */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2 bg-base-200 p-3 rounded-box border border-base-300">
                <ImageIcon className="size-4 text-base-content/50" />
                <span className="label-text">Select New Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* EXISTING IMAGES */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-base-content/50 ml-1">Existing Images</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {existingImages.map((src, idx) => (
                    <div key={idx} className="relative rounded-box overflow-hidden group">
                      <img src={src} alt="Existing" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW IMAGES PREVIEW */}
            {newPreviews.length > 0 && (
              <div className="space-y-2 mt-2">
                <span className="text-xs text-base-content/50 ml-1">New Images</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {newPreviews.map((src, idx) => (
                    <div key={idx} className="relative rounded-box overflow-hidden group">
                      <img src={src} alt="New preview" className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-control">
              <div className="flex items-start gap-2 p-3 rounded-box bg-base-200 border border-base-300">
                <FileTextIcon className="size-4 text-base-content/50 mt-1" />
                <textarea
                  placeholder="Description"
                  className="grow bg-transparent resize-none focus:outline-none min-h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <span className="text-base-content/50">¥</span>
              <input
                type="number"
                placeholder="Price"
                className="grow"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="5"
              />
            </label>

            {(isError || uploadImages.isError) && (
              <div role="alert" className="alert alert-error alert-sm">
                <span>Failed to update. Try again.</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isFormPending}>
              {isFormPending ? <span className="loading loading-spinner" /> : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default EditProductForm;