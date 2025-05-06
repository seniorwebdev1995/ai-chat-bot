const { getMainCourses, getSubTitles } = require("../utils/pinecone-helper");
const ChatController = {};

ChatController.getMainCourse = async (req) => {
  console.log("getMainCourse called : ", req.body);
  return getMainCourses(req.body);
};

ChatController.getSubTitle = async (req) => {
  console.log("getSubTitle called: ", req.body);
  return getSubTitles(req.body);
};

module.exports = ChatController;
