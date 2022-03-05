const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'soicondibui',
    api_key: '687338691861596',
    api_secret: 'B9GPaW98ynq5LXVhgmQkMMulYUg',
});

module.exports.uploadImage = async (path) => {
    let res;

    await cloudinary.uploader.upload(path, (err, result) => {
        if (err) {
            res = {
                status: 500,
                result: err,
            };
        } else {
            res = {
                status: 200,
                result,
            };
        }
    });

    return res;
};
