const Like = require("../models/like.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const Notification = require("../models/notification.model");
const Flightcrew = require("../models/flightcrew.model");
const PostService = {};

/**
 * Create new post
 * @param {string} content - Post content
 * @param {string} userId - userId who posts new Post
 * @returns {Promise<Post>}
 */
PostService.createNewPost = async (body, userId) => {
  try {
    const newPost = body.fc_creator
      ? {
          content: body.content,
          userId,
          fcCreator: body.fc_creator,
        }
      : {
          content: body.content,
          userId,
        };
    return (await Post.create(newPost)).populate("userId");
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

/**
 * Query for posts
 * @param {Object} filter - MongoDB filter
 * @param {Object} option - Query options
 * @param {string} [option.sortBy] - Sort option in the format sortField:(des|asc)
 * @param {number} [options.limit] - Maximum number of results per page ( default = 10 )
 * @param {number} [options.page] - Current page ( default = 1)
 * @returns {Promise<QueryResult>}
 */
PostService.queryPosts = async () => {
  try {
    return await Post.find({ fcCreator: null })
      .populate("userId")
      .populate("comments")
      .sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

PostService.queryFCPosts = async (req) => {
  try {
    return await Post.find({ fcCreator: req.body.creator_id })
      .populate("userId")
      .populate("comments")
      .sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

PostService.queryPostById = async (id) => {
  try {
    return await Post.findById(id).populate("userId");
  } catch (err) {
    console.log(err);
    throw err;
  }
};

PostService.queryCommentsByPostId = async (id) => {
  try {
    return await Comment.find({ postId: id })
      .populate("userId")
      .sort({ createdAt: -1 });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Increase like
 * @param {string} userId - id of user
 * @param {string} postId - id of post
 * @returns {Promise<Like>}
 */
PostService.createNewLike = async (userId, postId) => {
  try {
    return await Like.increaseLike(userId, postId);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Decrease like
 * @param {string} userId - id of user
 * @param {string} postId - id of post
 * @returns {Promise<Like>}
 */
PostService.createNewUnLike = async (userId, postId) => {
  try {
    return await Like.decreaseLike(userId, postId);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Create new comment
 * @param {string} userId - id of user
 * @param {string} postId - id of post
 * @param {string} content - content of comment
 */
PostService.createNewComment = async (content, userId, postId) => {
  try {
    const newComment = {
      content,
      userId,
      postId,
    };
    return await Comment.create(newComment);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Invite user to Flight Crew with email
 * @param {string} email - email of user
 */

PostService.inviteUserToFC = async (email, id) => {
  try {
    const newNotification = {
      to: email,
      from: id,
      type: 2,
    };
    await Notification.deleteOne({ to: email, from: id, type: 2 });
    return !!(await Notification.create(newNotification));
  } catch (err) {
    console.log("post/inviteFC", err);
    throw err;
  }
};

PostService.inviteFCCheck = async (email, id) => {
  try {
  } catch (err) {
    console.log("post/inviteFCCheck", err);
    throw err;
  }
};

PostService.acceptInvitation = async ({ creator_id, pid }, me) => {
  try {
    await Notification.findOneAndUpdate({ _id: pid }, { $set: { checked: 1 } });
    await Flightcrew.findOneAndUpdate(
      { creator: creator_id },
      { $push: { invited_users: me } }
    );
    return true;
  } catch (err) {
    console.log("post/acceptInvitation", err);
    throw err;
  }
};

PostService.declineInvitation = async ({ pid }) => {
  try {
    // await Notification.findOneAndUpdate({ from: id }, { $set: { checked: 1 } });
    await Notification.deleteOne({ _id: pid });
    return true;
  } catch (err) {
    console.log("post/acceptInvitation", err);
    throw err;
  }
};

PostService.getNotesForMe = async (data) => {
  try {
    return await Notification.find({
      $and: [{ checked: 0 }, { $or: [{ type: 0 }, { to: data.email }] }],
    }).populate("from");
  } catch (err) {
    console.log("post/getnotifications", err);
    throw err;
  }
};

PostService.createFC = async (req) => {
  try {
    const result = await Flightcrew.create({
      fc_name: req.body.crew,
      creator: req.user.id,
    });
    return await Flightcrew.findOne({ _id: result.id }).populate("creator");

    // return (await Flightcrew.create({ fc_name: req.body.crew, creator: req.user.id })).populate('creator')
  } catch (err) {
    console.log("post/createCrew", err);
    throw err;
  }
};

/**
 *
 * @param {ObjectId} id : FC owner's id
 * @returns all : FCs that i invited, mine : My FC info
 */
PostService.queryAllFC = async (id) => {
  try {
    const all = await Flightcrew.find({
      creator: { $ne: id },
      invited_users: { $in: [id] },
    }).populate("creator");
    const mine = await Flightcrew.find({ creator: id }).populate("creator");
    return { all, mine };
  } catch (err) {
    console.log("post/createCrew", err);
    throw err;
  }
};

PostService.getMyFCInfo = async (id) => {
  try {
    const mine = await Flightcrew.find({ creator: id })
      .populate("creator")
      .populate("invited_users");
    const pending = await Notification.find({ from: id, type: 2, checked: 0 });
    return { mine, pending };
  } catch (err) {
    console.log("post/getMyFCInfo", err);
    throw err;
  }
};

PostService.removeFromFC = async (creatorId, userId) => {
  try {
    return await Flightcrew.updateOne(
      { creator: creatorId },
      { $pull: { invited_users: userId } }
    );
  } catch (err) {
    console.log("post/removeFromFC", err);
    throw err;
  }
};

module.exports = PostService;
