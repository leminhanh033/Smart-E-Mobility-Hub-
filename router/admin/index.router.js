const router=require("express").Router();

const accountRouter=require("./account.router");
const hubRouter=require("./hub.router");
const incidentRouter=require("./incident.router");
const simulationRouter=require("./simulation.router");
const dispatchRouter=require("./dispatch.router")
const chargingRouter=require("./charging.router")
const dashboardRouter=require("./dashboard.router");
const vehicleRouter=require("./vehicle.router");
const chargingPortROuter=require("./chargingPort.router");

router.use("/",dashboardRouter);

router.use("/",accountRouter);

router.use("/hub",hubRouter);

router.use("/incident",incidentRouter);

router.use("/simulation",simulationRouter);

router.use("/dispatch",dispatchRouter);

router.use("/charging",chargingRouter);

router.use("/vehicle",vehicleRouter);

router.use("/charging/port",chargingPortROuter)

module.exports=router;