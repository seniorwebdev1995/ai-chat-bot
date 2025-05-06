const express = require("express");
const { catchAsync } = require("../utils/catchAsync");
const {
  // deliverEmail,
  verifyEmail,
  contactUs,
} = require("../services/email.service");
const router = express.Router();

router.post(
  "/sendEmail",
  catchAsync(async (req, res) => {
    console.log("email send called--");
    res.status(200).json(
      "Email sent!"
      // await deliverEmail(req.body)
    );
  })
);

router.post(
  "/contactUs",
  catchAsync(async (req, res) => {
    console.log("email send called--");
    res.status(200).json(await contactUs(req.body));
  })
);

router.post(
  "/verifyEmail",
  catchAsync(async (req, res) => {
    console.log("email verify called--");
    res.status(200).json(await verifyEmail(req.body));
  })
);

module.exports = router;
