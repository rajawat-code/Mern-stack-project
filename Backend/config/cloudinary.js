const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBuffer = (fileBuffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    // If credentials are dummy/placeholder, fall back immediately to data URI
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    if (!apiKey || apiKey.includes('12345678') || !cloudName || cloudName.includes('dmycloud')) {
      const mime = resourceType === 'video' ? 'video/mp4' : 'image/jpeg';
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:${mime};base64,${base64}`;
      return resolve(dataUrl);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: 'linkedin_clone' },
      (error, result) => {
        if (error) {
          // If Cloudinary fails (e.g. invalid signature, expired API keys, network issues), fall back to data URI
          const mime = resourceType === 'video' ? 'video/mp4' : 'image/jpeg';
          const base64 = fileBuffer.toString('base64');
          const dataUrl = `data:${mime};base64,${base64}`;
          return resolve(dataUrl);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadBuffer,
};
