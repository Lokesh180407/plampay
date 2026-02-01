const express = require('express');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
        success: true,
        data: {
            url: fileUrl,
            filename: req.file.filename,
        },
    });
});

module.exports = router;
