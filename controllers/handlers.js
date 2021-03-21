const Board = require("../models");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// done
async function getThreads(req, res) {
  const board = req.params.board;

  const boardInfo = await Board.findOne({ board }).exec();

  if (!boardInfo) return res.json([]);

  const threads = boardInfo.threads || [];

  res.json(threads);
}

async function createThread(req, res) {
  const { board } = req.params;
  const { text, delete_password } = req.body;

  await Board.findOneAndUpdate(
    {
      board,
    },
    {
      $push: {
        threads: {
          delete_password,
          text,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  // TODO: bug url missing the last character nana -> nan
  res.redirect(`/b/${board}/`);
}

// done
async function updateThread(req, res) {
  const { report_id } = req.body;
  const board = req.body.board || req.params.board;

  await Board.updateOne(
    {
      board,
      "threads._id": ObjectId(report_id),
    },
    {
      $set: {
        "threads.$.reported": true,
      },
    }
  );

  res.json("reported");
}

// done
async function deleteThread(req, res) {
  const { thread_id, delete_password } = req.body;
  const { board } = req.params;

  const result = await Board.findOneAndUpdate(
    {
      board,
      "threads._id": ObjectId(thread_id),
      "threads.delete_password": delete_password,
    },
    {
      $pull: {
        threads: {
          _id: ObjectId(thread_id),
          delete_password: delete_password,
        },
      },
    },
    { new: true }
  );

  if (!result) return res.json("incorrect password");

  res.json("success");
}

// done
async function getReplies(req, res) {
  const { board } = req.params;
  const { thread_id } = req.query;

  const boardInfo = await Board.findOne(
    {
      board,
    },
    {
      threads: {
        $elemMatch: {
          _id: ObjectId(thread_id),
        },
      },
    }
  ).exec();

  if (!boardInfo) return res.json([]);

  try {
    const replies = boardInfo.threads[0] || [];
    res.json(replies);
  } catch (err) {
    console.log("Error when get replies", JSON.stringify(err));
    res.json([]);
  }
}

// done
async function createReply(req, res) {
  const { board } = req.params;
  const { thread_id, text, delete_password } = req.body;

  await Board.updateOne(
    {
      board,
      "threads._id": ObjectId(thread_id),
    },
    {
      $push: {
        "threads.$.replies": {
          delete_password,
          text,
          created_on: new Date(),
        },
      },
      $inc: {
        "threads.$.replycount": 1,
      },
    }
  );

  res.redirect(`/b/${board}/${thread_id}`);
}

// done
async function updateReply(req, res) {
  const { board } = req.params;
  const { thread_id, reply_id } = req.body;

  await Board.findOneAndUpdate(
    {
      board,
      "threads.replies._id": reply_id,
    },
    {
      $set: {
        "threads.$[i].replies.$[j].reported": true,
      },
    },
    {
      arrayFilters: [
        {
          "i._id": ObjectId(thread_id),
        },
        {
          "j._id": ObjectId(reply_id),
        },
      ],
      new: true,
    }
  );

  res.json("reported");
}

// done
async function deleteReply(req, res) {
  // Not delete reply, just update text to `[deleted]`
  const { board } = req.params;
  const { reply_id, thread_id, delete_password } = req.body;

  console.log("ready to delete", board, reply_id, thread_id);
  const result = await Board.findOneAndUpdate(
    {
      board,
      "threads.replies.delete_password": delete_password,
    },
    {
      $set: {
        "threads.$[i].replies.$[j].text": "[deleted]",
      },
    },
    {
      arrayFilters: [
        {
          "i._id": ObjectId(thread_id),
        },
        {
          "j._id": ObjectId(reply_id),
          "j.delete_password": delete_password,
        },
      ],
      new: true,
    }
  );

  if (!result) return res.json("incorrect password");

  res.json("success");
}

module.exports = {
  getThreads,
  createThread,
  updateThread,
  deleteThread,
  getReplies,
  createReply,
  updateReply,
  deleteReply,
};
