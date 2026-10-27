const router = require('express').Router();
const usermodel = require("../../models/user.model")

const accountRouter = require("./account.router");
const bookRouter = require("./book.router")
const sharedVehicleRouter = require("./sharedVehicle.router");
const activityRouter = require("./activity.router");
const reportRouter = require("./report.router");

const hubmodel=require("../../models/hub.model")

const checkLogin = async (req, res, next) => {
  if (req.cookies.login) {
    const user = await usermodel.findOne({
      _id: req.cookies.login.id,
    })
    if (user) {
      res.locals.account = user;
      req.account=user;
      next();
      return;
    }
    else {
      res.clearCookie("login");
      res.redirect("/login");
      return;
    }
  }
  else {
    res.redirect("/login");
  }
}

router.use("/", accountRouter);

router.use("/book",checkLogin, bookRouter);

router.use("/shared-vehicle",checkLogin, sharedVehicleRouter);

router.use("/activity",checkLogin, activityRouter);

router.use("/report",checkLogin, reportRouter);

router.get('/', checkLogin, async(req, res) => {
  const hubTotal=await hubmodel.countDocuments({});
  const hubActive=await hubmodel.countDocuments({status:"active"});
  res.render('pages/user/homepage', {
    title: "Trang chủ",
    activePage: "home",
    hubTotal,
    hubActive,
  })
})



module.exports = router;