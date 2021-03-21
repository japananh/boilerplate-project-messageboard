"use strict";

const {
  getThreads,
  createThread,
  updateThread,
  deleteThread,
  getReplies,
  createReply,
  updateReply,
  deleteReply,
} = require("../controllers/handlers");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(createThread)
    .get(getThreads)
    .put(updateThread)
    .delete(deleteThread);

  app
    .route("/api/replies/:board")
    .post(createReply)
    .get(getReplies)
    .put(updateReply)
    .delete(deleteReply);
};
