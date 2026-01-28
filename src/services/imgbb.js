const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

/**
 * Uploads an image file to ImgBB and returns the direct URL.
 * @param {File} imageFile - The image file to upload.
 * @returns {Promise<string>} - The URL of the uploaded image.
 */
export const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) throw new Error("No image file provided");

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || "Failed to upload image");
        }

        return data.data.url;
    } catch (error) {
        console.error("ImgBB Upload Error:", error);
        throw error;
    }
};
