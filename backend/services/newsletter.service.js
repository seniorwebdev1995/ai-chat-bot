const { User } = require("../models");
const Newsletter = require("../models/newsletter.model");
const Post = require("../models/post.model");
const Template = require("../models/template.model");
// const { deliverEmail } = require("./email.service");
// console.log("deliverEmail-----------------------", deliverEmail);
const NewsletterService = {};

/**
 * Update subscribe emails list
 * @param {array} emails - User Emails
 * @param {string} userId - userId who subscribes Newsletter
 * @returns {Promise<Post>}
 */
NewsletterService.updateNewsletterSubscribe = async (body, userId) => {
  const { emails, subscribeStatus } = body;
  try {
    return await Newsletter.findOneAndUpdate(
      { owner: userId },
      { emails, subscribeStatus },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @param {String} userId - Id of user that we wanna get emails
 * @returns {Promise<Newsletter>} - List of emails that subscribe news letter
 */
NewsletterService.getNewsletterSubscribe = async (userId) => {
  try {
    return await Newsletter.find({ owner: userId });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @returns {Promise<Newsletter>} - List of info about Newsletter subscribe and user
 */
NewsletterService.getAllNewsletterInfo = async () => {
  try {
    return await Newsletter.aggregate([
      {
        $match: {
          $expr: { $gt: [{ $size: "$emails" }, 0] }, // Checking if the size of 'emails' is greater than 1
        },
      },
      {
        $lookup: {
          from: "users", // The collection to join (assuming 'users' is the collection name)
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
    ]);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @param {Object} _id - Id of user that wanna subscribe
 * @returns {Promise<Newsletter>} - List of emails that subscribe news letter
 */
NewsletterService.updateNewsletterStatus = async (body) => {
  try {
    const doc = await Newsletter.findById(body._id);
    if (doc) {
      const updatedValue = !doc.subscribeStatus; // Toggle the field value from true to false or false to true\
      console.log(doc);
      console.log(updatedValue);
      console.log(doc.subscribeStatus);
      // Update the document with the toggled value
      return await Newsletter.findByIdAndUpdate(
        body._id,
        { $set: { subscribeStatus: updatedValue } },
        { new: true }
      );
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @param {Object} body - parameters for create Template : template name, urls, date, messages, content
 * @returns {Promise<Templates>} - Newly created Template
 */
NewsletterService.createNewsletterTemplate = async (body) => {
  try {
    return await Template.create(body);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @param {Object} body - parameters for create Template : template name, urls, date, messages, content
 * @returns {Promise<Templates>} - updated Template
 */
NewsletterService.updateNewsletterTemplate = async (body) => {
  try {
    // const { name, urls, messages, content, date } = body;
    return body._id
      ? await Template.findOneAndUpdate({ _id: body._id }, body.newTemplateInfo)
      : await Template.create(body.newTemplateInfo);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @param {Object} body - parameters for remove Template : template id
 * @returns {Promise<Templates>} - removed template
 */
NewsletterService.removeNewsletterTemplate = async (body) => {
  try {
    return await Template.findByIdAndRemove(body.id);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @returns {Promise<Templates>} - all Templates info
 */
NewsletterService.getNewsletterTemplatesInfo = async (req) => {
  try {
    return req.body.id
      ? await Template.find({ _id: req.body.id }).populate({
          path: "messages", // First level of population
          populate: {
            path: "userId", // Second level of population (inside field1)
            model: "User", // Model of the nestedField collection
          },
        })
      : await Template.find({});
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * @param {String} - id of new selected object
 * @returns {Promise<Templates>} - all Templates info
 */
NewsletterService.updateNewsletterSelected = async (req) => {
  try {
    await Template.findOneAndUpdate({ selected: true }, { selected: false });
    return await Template.findOneAndUpdate(
      { _id: req.body._id },
      { selected: true }
    );
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

NewsletterService.sendNewsletter = async () => {
  try {
    const emaillist = await Newsletter.find({ subscribeStatus: true }).distinct(
      "emails"
    );
    console.log("emaillist --------", emaillist);
    // for (let i = 0; i < emaillist.length; i++)
    //   deliverEmail({
    //     email: emaillist[i],
    //     flag: 3,
    //   });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

NewsletterService.updateNewsletterOldUser = async (req) => {
  try {
    const users = await User.find();
    const newsletters = await Newsletter.find();
    const usersInNewsletter = newsletters.map((item, idx) =>
      item.owner.toString()
    );
    for (let i = 0; i < users.length; i++) {
      if (usersInNewsletter.includes(users[i]._id.toString())) {
        continue;
      } else
        Newsletter.create({
          owner: users[i].id,
          emails: [users[i].email],
          subscribeStatus: true,
        });
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

module.exports = NewsletterService;
