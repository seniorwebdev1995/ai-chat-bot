const User = require("../models/user.model");
const {
  createPathIfNotExists,
  generateHex,
  getText,
} = require("../utils/helperFunc");
const fs = require("fs");
const path = require("path");
const Document = require("../models/document.model");
const { removePineconeData, run } = require("../utils/pinecone-helper");
const { getProfileInfo } = require("../utils/getProfileInfo");
const AdminService = {};

/**
 * Remove user by ID
 * @param {string} userId - userId for deletion
 * @returns {Promise<User>}
 */
AdminService.removeUserById = async (userId) => {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Remove users by IDs
 * @param {array} userIds - userIds for deletion
 * @returns {Promise<User>}
 */
AdminService.removeUserByIds = async (userIds) => {
  try {
    return await User.deleteMany({ _id: { $in: userIds } });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Update permission
 * @param {string} userId - UserId for update permission
 * @param {array <string>} permission - Permission for updates
 * @returns {Promise<User>}
 */
AdminService.updateRoleById = async (userId, role) => {
  try {
    const user = await User.findById(userId);
    if (!user) return "User not found with that Id";
    user.role = role;
    return await user.save();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const createFile = async (file, save_path = process.env.DOCPATH) => {
  /** Save File to Local */
  createPathIfNotExists(save_path);
  const randomFileName = generateHex();
  await fs
    .createReadStream(file.filepath)
    .pipe(
      fs.createWriteStream(
        path.resolve(
          process.env.DOCPATH +
            randomFileName +
            "." +
            file.originalFilename.split(".").pop()
        )
      )
    );

  /** Save File to DB */
  const newDocument = {
    name: file.originalFilename,
    hex: randomFileName,
  };
  await Document.create(newDocument);
  return randomFileName;
};

/**
 * Save File to Local and DB
 * @param {File} file - File Object need to save
 * @param {string} filename - file name to save
 */
AdminService.saveFile = async (file) => {
  try {
    console.log("saveFile called ----------");

    const randomFileName = await createFile(file);

    return await run(
      path.resolve(
        process.env.DOCPATH +
          randomFileName +
          "." +
          file.originalFilename.split(".").pop()
      )
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

AdminService.uploadPDFAndGetInfo = async (files) => {
  try {
    let texts = "";
    for (let i = 0; i < files.length; i++) {
      const randomFileName = await createFile(files[i]);
      texts += await getText(
        path.resolve(
          process.env.DOCPATH +
            randomFileName +
            "." +
            files[i].originalFilename.split(".").pop()
        )
      );
    }
    const results = await getProfileInfo(texts);
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

AdminService.uploadPDFAndGetInfo1 = async (files, userId) => {
  try {
    const save_path = `${process.env.C_DOC_PATH}${userId}/`;
    const file_name = await createFile(files[0], save_path);
    const texts = await getText(
      path.resolve(
        process.env.C_DOC_PATH +
          file_name +
          "." +
          files[0].originalFilename.split(".").pop()
      )
    );
    const results = await getProfileInfo(texts);
    return [`${save_path}${file_name}`, results];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

AdminService.scrapURL = async (url) => {
  try {
    return await run(null, url);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

AdminService.removePinecones = async (del_flag) => {
  try {
    return await removePineconeData(del_flag);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = AdminService;
