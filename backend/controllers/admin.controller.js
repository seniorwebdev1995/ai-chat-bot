const formidable = require("formidable");
const {
  removeUserById,
  removeUserByIds,
  saveFile,
  updateRoleById,
  scrapURL,
  removePinecones,
  uploadPDFAndGetInfo,
  uploadPDFAndGetInfo1,
} = require("../services/admin.service");
const AdminController = {};

AdminController.removeUser = async (req, res) => {
  const userId = req.body.userId;
  return await removeUserById(userId);
};

AdminController.removeUsers = async (req, res) => {
  const userIds = req.body.userIds;
  return await removeUserByIds(userIds);
};

AdminController.updateRole = async (req, res) => {
  const userId = req.body.userId;
  const newRoles = req.body.roles;
  return await updateRoleById(userId, newRoles);
};

AdminController.ingest = async (req, res) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      const result = fields.url
        ? await scrapURL(fields.url[0])
        : await saveFile(files.file[0]);
      resolve(result);
    });
  });
};

AdminController.uploadProfilePDF = async (req, res) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      const result = await uploadPDFAndGetInfo(files.profile);
      resolve(result);
    });
  });
};

AdminController.uploadProfilePDF1 = async (req, userId) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      const result = await uploadPDFAndGetInfo1(files.profile, userId);
      resolve(result);
    });
  });
};

AdminController.removePinecone = async (req, res) => {
  const del_flag = req.body.del_flag;
  return await removePinecones(del_flag);
};

module.exports = AdminController;
