const {
  createNewComment,
  createNewLike,
  createNewPost,
  createNewUnLike,
  queryPosts,
  queryFCPosts,
  queryPostById,
  queryCommentsByPostId,
  inviteUserToFC,
  acceptInvitation,
  declineInvitation,
  getNotesForMe,
  createFC,
  queryAllFC,
  getMyFCInfo,
  removeFromFC,
} = require("../services/post.service");
const PostController = {};

PostController.addPost = async (req, res) => {
  return await createNewPost(req.body, req.user._id);
};

PostController.getPosts = async (req, res) => {
  return await queryPosts();
};

PostController.acceptInvite = async (body, me) => {
  return await acceptInvitation(body, me);
};

PostController.declineInvite = async (body) => {
  return await declineInvitation(body);
};

PostController.getAllFC = async (id) => {
  return await queryAllFC(id);
};

PostController.getFCPosts = async (req) => {
  return await queryFCPosts(req);
};

PostController.createCrew = async (req) => {
  return await createFC(req);
};

PostController.inviteFC = async (email, id) => {
  return await inviteUserToFC(email, id);
};

PostController.getNotifications = async (data) => {
  return await getNotesForMe(data);
};

PostController.getPostById = async (id) => {
  return await queryPostById(id);
};

PostController.getCommentsById = async (id) => {
  return await queryCommentsByPostId(id);
};

PostController.like = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user._id;
  return await createNewLike(userId, postId);
};

PostController.unlike = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user._id;
  return await createNewUnLike(userId, postId);
};

PostController.comment = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user._id;
  return await createNewComment(content, userId, postId);
};

PostController.getFCInfo = async (req, res) => {
  const id = req.user._id;
  console.log(id);
  return await getMyFCInfo(id);
};

PostController.removeUserFromFC = async (req, res) => {
  return await removeFromFC(req.user._id, req.body.userId);
};

module.exports = PostController;
