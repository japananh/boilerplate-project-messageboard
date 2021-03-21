const mongoose = require("mongoose");
const { toJSON } = require("./plugins");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const replySchema = Schema(
  {
    delete_password: {
      type: String,
      required: true,
    },
    reported: {
      type: Boolean,
      required: true,
      default: false,
    },
    text: {
      type: String,
      required: true,
    },
    created_on: {
      type: Date,
      required: true,
    },
    bumped_on: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  {
    timestamps: { createdAt: "created_on", updatedAt: "bumped_on" },
    versionKey: false,
  }
);

const threadSchema = Schema(
  {
    delete_password: {
      type: String,
      required: true,
    },
    reported: {
      type: Boolean,
      required: true,
      default: false,
    },
    text: {
      type: String,
    },
    replycount: {
      type: Number,
      required: true,
      default: 0,
    },
    replies: {
      type: [replySchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: { createdAt: "created_on", updatedAt: "bumped_on" },
    versionKey: false,
  }
);

const boardSchema = Schema(
  {
    board: {
      type: String,
      unique: true,
      required: true,
    },
    threads: {
      type: [threadSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: { createdAt: "created_on", updatedAt: "bumped_on" },
    versionKey: false,
  }
);

// add plugin that converts mongoose to json
boardSchema.plugin(toJSON);

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;
