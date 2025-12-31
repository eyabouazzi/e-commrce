// Cloudinary integration removed.
// This file kept as a stub to avoid breaking imports. If any code still
// attempts to use Cloudinary, it will receive a clear error message.

const cloudinaryStub = {
  uploader: {
    upload: async () => {
      throw new Error("Cloudinary integration has been removed from this project.");
    },
    destroy: async () => {
      throw new Error("Cloudinary integration has been removed from this project.");
    },
  },
};

export default cloudinaryStub;
