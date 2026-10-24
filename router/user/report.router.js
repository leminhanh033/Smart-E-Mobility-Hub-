const router=require('express').Router();
const hubmodel=require("../../models/hub.model")
const reportmodel=require("../../models/report.model")
const {errorList}=require("../../configs/variable.config")

router.get('/issue', async(req, res) => {
  const hubList=await hubmodel.find({});
  res.render('pages/user/report-issue',{
    title:"Trang báo cáo sự cố",
    activePage:"report",
    hubList,
    errorList
  })
})

router.post('/issue', async(req, res) => {
  req.body.createdBy=req.account._id
  const newReport=new reportmodel(req.body);
  await newReport.save();
  res.json({
    code:"success",
    message:"Tạo báo cáo sự cố thành công"
  })
})

module.exports=router;