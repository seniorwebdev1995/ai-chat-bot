const express = require("express");
const router = express.Router();
const authRouter = require("./auth.routes");
const adminRouter = require("./admin.routes");
const postRouter = require("./post.routes");
const profileRouter = require("./profile.routes");
const chatRouter = require("./chat.routes");
const emailRouter = require("./email.routes");
const newsletterRouter = require("./newsletter.routes");

const defaultRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/admin",
    route: adminRouter,
  },
  {
    path: "/post",
    route: postRouter,
  },
  {
    path: "/profile",
    route: profileRouter,
  },
  {
    path: "/chat",
    route: chatRouter,
  },
  {
    path: "/email",
    route: emailRouter,
  },
  {
    path: "/newsletter",
    route: newsletterRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
