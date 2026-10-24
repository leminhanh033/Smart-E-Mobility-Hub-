const express = require('express');
const app = express()
const port = 3000;
const path=require("path");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')

const userRouter=require("./router/user/index.router")
const adminRouter=require("./router/admin/index.router")
const {connect}=require("./configs/database.config");

connect();

app.use(express.json());
app.use(cookieParser())

app.set('views', path.join(__dirname,'./views'))
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname,'./public')));


app.use("/",userRouter);
app.use("/admin",adminRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


