const {
  updateNewsletterSubscribe,
  getNewsletterSubscribe,
  getAllNewsletterInfo,
  updateNewsletterStatus,
  createNewsletterTemplate,
  updateNewsletterTemplate,
  getNewsletterTemplatesInfo,
  updateNewsletterSelected,
  removeNewsletterTemplate,
  updateNewsletterOldUser,
} = require("../services/newsletter.service");
const NewsletterController = {};

NewsletterController.updateSubscribe = async (req, res) => {
  return await updateNewsletterSubscribe(req.body, req.user._id);
};

NewsletterController.getSubscribe = async (req, res) => {
  return await getNewsletterSubscribe(req.user._id);
};

NewsletterController.getAllInfo = async (req, res) => {
  return await getAllNewsletterInfo();
};

NewsletterController.updateStatus = async (req, res) => {
  return await updateNewsletterStatus(req.body);
};

NewsletterController.createTemplate = async (req, res) => {
  return await createNewsletterTemplate(req.body);
};

NewsletterController.updateTemplate = async (req, res) => {
  return await updateNewsletterTemplate(req.body);
};

NewsletterController.removeTemplate = async (req, res) => {
  return await removeNewsletterTemplate(req.body);
};

NewsletterController.getTemplatesInfo = async (req, res) => {
  return await getNewsletterTemplatesInfo(req);
};

NewsletterController.updateSelected = async (req, res) => {
  return await updateNewsletterSelected(req);
};

NewsletterController.updateOldUser = async (req, res) => {
  return await updateNewsletterOldUser(req);
};

module.exports = NewsletterController;
