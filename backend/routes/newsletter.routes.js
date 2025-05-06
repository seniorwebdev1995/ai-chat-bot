const express = require("express");
const passport = require("passport");
const { catchAsync } = require("../utils/catchAsync");
const router = express.Router();
const { verifyRole } = require("../middlewares/admin");
const {
  updateSubscribe,
  getSubscribe,
  getAllInfo,
  updateStatus,
  createTemplate,
  updateTemplate,
  getTemplatesInfo,
  updateSelected,
  removeTemplate,
  updateOldUser,
} = require("../controllers/newsletter.controller");
const { urltest } = require("../utils/pinecone-helper");

router.post(
  "/updateSubscribe",
  passport.authenticate("jwt", { session: false }),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/updateSubscribe called --------");
    res.status(200).json(await updateSubscribe(req, res));
  })
);

router.post(
  "/getSubscribe",
  passport.authenticate("jwt", { session: false }),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/getSubscribe called --------");
    res.status(200).json(await getSubscribe(req, res));
  })
);

router.post(
  "/getAllInfo",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/getAllInfoe called --------");
    res.status(200).json(await getAllInfo(req, res));
  })
);

router.post(
  "/getTemplatesInfo",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/getTemplatesInfo called --------");
    res.status(200).json(await getTemplatesInfo(req, res));
  })
);

router.post(
  "/updateStatus",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/updateStatuse called --------");
    res.status(200).json(await updateStatus(req, res));
  })
);

router.post(
  "/createTemplate",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/createTemplate called --------");
    res.status(200).json(await createTemplate(req, res));
  })
);

router.post(
  "/updateTemplate",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/updateTemplate called --------");
    res.status(200).json(await updateTemplate(req, res));
  })
);

router.post(
  "/removeTemplate",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/removeTemplate called --------");
    res.status(200).json(await removeTemplate(req, res));
  })
);

router.post(
  "/updateSelected",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/updateSelected called --------");
    res.status(200).json(await updateSelected(req, res));
  })
);

router.post(
  "/urltest",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/urltest called --------");
    res.status(200).json(await urltest(req, res));
  })
);

router.post(
  "/updateOldUser",
  passport.authenticate("jwt", { session: false }),
  verifyRole(["admin"]),
  catchAsync(async (req, res) => {
    console.log("/api/newsletter/updateOldUser called --------");
    res.status(200).json(await updateOldUser(req, res));
  })
);

module.exports = router;
