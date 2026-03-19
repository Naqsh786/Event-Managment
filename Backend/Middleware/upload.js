
import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save files to '/tmp/' folder for Vercel support
        // Vercel's filesystem is read-only except for /tmp/
        cb(null, '/tmp/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check file type
const checkFileType = (file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|webp/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only! (Allowed: jpeg, jpg, png, gif, webp)');
    }
};

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

export default upload;
