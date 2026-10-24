// getting-started.js
require('dotenv').config()
const mongoose = require('mongoose');

module.exports.connect= async()=> {
  try{
    await mongoose.connect(process.env.SERVER);
    console.log("Kết nối cơ sở dữ liệu thành công")
  }
  catch(err){
    console.log(err)
  }
}