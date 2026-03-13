import { Link, useNavigate } from "react-router";
import { useCreateProduct, useUploadImages } from "../hooks/useProducts";
import { useState } from "react";
import { ArrowLeftIcon, FileTextIcon, ImageIcon, SparklesIcon, TypeIcon, XIcon } from "lucide-react";

function CreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const uploadImages = useUploadImages();
  
  const [formData, setFormData] = useState({ title: "", description: "", price: "" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select at least one image");
      return;
    }

    try {
      const uploadData = new FormData();
      selectedFiles.forEach((file) => uploadData.append("images", file));
      
      const uploadResult = await uploadImages.mutateAsync(uploadData);
      const imageUrls = uploadResult.data;

      createProduct.mutate({ ...formData, imageUrls }, {
        onSuccess: () => navigate("/"),
      });
    } catch (error) {
      console.error("Error uploading or creating:", error);
    }
  };

  const isPending = uploadImages.isPending || createProduct.isPending;

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeftIcon className="size-4" /> Back
      </Link>

      <div className="card bg-base-300">
        <div className="card-body">
          <h1 className="card-title">
            <SparklesIcon className="size-5 text-primary" />
            New Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* TITLE INPUT */}
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
                <span className="label-text">Select Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* IMG PREVIEW GRID */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative rounded-box overflow-hidden group">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
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
            {/* PRICE INPUT */}
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

            {(createProduct.isError || uploadImages.isError) && (
              <div role="alert" className="alert alert-error alert-sm">
                <span>Failed to create. Try again.</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner" />
              ) : (
                "Create Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default CreatePage;