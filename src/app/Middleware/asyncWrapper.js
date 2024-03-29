const path = require('path');

module.exports = (fn) => {
    return async function (req, res, next) {
        try {
            return await fn(req, res, next);
        } catch (error) {
            console.log(error);

            res.status(500).sendFile(
                path.join(__dirname, '../../views/500.html')
            );
        }
    };
};
