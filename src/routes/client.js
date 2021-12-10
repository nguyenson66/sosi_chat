const express = require('express')
const router = express.Router();


router.get('', (req, res) => {
    res.send('Nguyen Hong Son')
})

module.exports = router