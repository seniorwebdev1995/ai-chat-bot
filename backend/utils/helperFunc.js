const crypto = require("crypto");
const fs = require("fs");
// const textract = require('textract')
const { scrapeDatas } = require("./scrapData");

const generateHex = () => {
  const hash = crypto
    .createHash("sha256")
    .update(crypto.randomBytes(32))
    .digest("hex");
  return hash;
};

const createPathIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
};

const getText = async (filepath) => {
  return new Promise((resolve, reject) => {
    // textract.fromFileWithPath(filepath, (err, txt) => {
    //   resolve(txt);
    // });
  });
};

const getTextFromURL = async (url) => {
  return await scrapeDatas(url);
};

const formatMongoDBDate = (mongoDBDate) => {
  const date = new Date(mongoDBDate);
  const options = { month: "long", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleString("en-US", options);
  return formattedDate;
};

const MAX_LENGTH = 27;
const truncateString = (str, maxLength = MAX_LENGTH) => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 3) + "...";
  } else {
    return str;
  }
};

module.exports = {
  generateHex,
  createPathIfNotExists,
  getText,
  getTextFromURL,
  formatMongoDBDate,
  truncateString,
};
