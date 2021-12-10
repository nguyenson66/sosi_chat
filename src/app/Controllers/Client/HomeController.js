const path = require('path')
// const layout_default = path.join(__dirname + '../../../../Views/layouts/admin-layout')

exports.home = async (req,res) => {
    res.render('client/home', {title : 'Chào mừng bạn đến trang trò chuyện online của Sosi'})
}