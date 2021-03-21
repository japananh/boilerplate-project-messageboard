const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Board = require("../models");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  before((done) => {
    Board.collection.drop();
    done();
  });

  after((done) => {
    Board.collection.drop();
    done();
  });

  suite("TEST request to /api/threads/{board}", () => {
    const board = `test-threads-${new Date().getTime()}`;
    let thread_id = "";
    const board_password = `password-${new Date().getTime()}`;
    const incorrect_board_password = `incorrect-password-${Math.random}`;

    test("Create a new thread: POST request to /api/threads/{board}", (done) => {
      const delete_password = board_password;
      const text = `Text ${new Date().getTime()}`;

      chai
        .request(server)
        .post(`/api/threads/${board}`)
        .send({ delete_password, text })
        .end((_err, res) => {
          assert.equal(res.status, 200);

          done();
        });
    });

    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .get(`/api/threads/${board}`)
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body, "response should be an array");

          if (res.body.length) {
            thread_id = res.body[0]._id;

            res.body.forEach((thread) => {
              assert.isString(thread.bumped_on, "bumped_on should be a string");
              assert.isString(
                thread.created_on,
                "created_on should be a string"
              );
              assert.isString(
                thread.delete_password,
                "delete_password should be a string"
              );
              assert.isString(thread.text, "text should be a string");
              assert.isBoolean(
                thread.reported,
                "reported should be true or false"
              );
              assert.isArray(thread.replies, "replies should be an array");
              assert.equal(
                thread.replycount,
                thread.replies.length,
                "replycount should be equal the length of replies array"
              );
            });
          }

          done();
        });
    });

    test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .put(`/api/threads/${board}`)
        .send({ report_id: thread_id })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(
            res.body,
            "reported",
            "response should return `reported` string"
          );

          done();
        });
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .delete(`/api/threads/${board}`)
        .send({ thread_id, delete_password: incorrect_board_password })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(
            res.body,
            "incorrect password",
            "response should return `incorrect password` string"
          );

          done();
        });
    });

    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .delete(`/api/threads/${board}`)
        .send({ board, thread_id, delete_password: board_password })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(
            res.body,
            "success",
            "response should return `success` string"
          );

          done();
        });
    });
  });

  suite("TEST request to /api/replies/{board}", () => {
    const board = `test-replies-${new Date().getTime()}`;
    let thread_id = "";
    let reply_id = "";
    const thread_password = `password-${new Date().getTime()}`;
    const reply_password = `password-${new Date().getTime()}`;
    const incorrect_reply_password = `incorrect-password-${new Date().getTime()}`;

    test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
      const thread_text = "thread 1";
      const reply_text = "reply 1";

      // Create a new thread
      chai
        .request(server)
        .post(`/api/threads/${board}`)
        .send({ delete_password: thread_password, text: thread_text })
        .end((_err, res) => {
          assert.equal(res.status, 200);

          // Get thread_id
          chai
            .request(server)
            .get(`/api/threads/${board}`)
            .end((_err, res) => {
              assert.equal(res.status, 200);
              assert.isArray(res.body, "response should be an array");
              assert.isAtLeast(
                res.body.length,
                1,
                "response array should have at least 1 item"
              );
              assert.equal(
                ObjectId.isValid(res.body[0]._id),
                true,
                "_id should be a valid objectId"
              );

              thread_id = res.body[0]._id;

              // Create new reply from created thread above
              chai
                .request(server)
                .post(`/api/replies/${board}`)
                .send({
                  thread_id,
                  text: reply_text,
                  delete_password: reply_password,
                })
                .end((_err, res) => {
                  assert.equal(res.status, 200);

                  done();
                });
            });
        });
    });

    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .get(`/api/replies/${board}`)
        .query({ thread_id })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.containsAllKeys(res.body, [
            "bumped_on",
            "created_on",
            "delete_password",
            "replycount",
            "replies",
            "reported",
            "text",
            "_id",
          ]);
          assert.isBoolean(
            res.body.reported,
            "response should have a property reported as a boolean"
          );
          assert.isString(
            res.body.delete_password,
            "response should have a property delete_password as a string"
          );
          assert.isString(
            res.body.text,
            "response should have a property text as a string"
          );
          assert.equal(
            ObjectId.isValid(res.body._id),
            true,
            "_id should be a valid objectId"
          );

          assert.isArray(
            res.body.replies,
            "response should have a property replies as an array"
          );
          assert.isAtLeast(
            res.body.replies.length,
            1,
            "replies should have at least 1 item"
          );
          assert.equal(
            res.body.replycount,
            res.body.replies.length,
            "replycount should be equal to the length of replies array"
          );

          res.body.replies.forEach((reply) => {
            assert.containsAllKeys(reply, [
              "created_on",
              "delete_password",
              "reported",
              "text",
              "_id",
            ]);
          });

          reply_id = res.body.replies[0]._id;

          done();
        });
    });

    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .delete(`/api/replies/${board}`)
        .send({
          thread_id,
          reply_id,
          delete_password: incorrect_reply_password,
        })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(
            res.body,
            "incorrect password",
            "response should return incorrect password"
          );

          done();
        });
    });

    test("Deleting a reply with correct password: DELETE request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .delete(`/api/replies/${board}`)
        .send({ thread_id, reply_id, delete_password: reply_password })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, "success", "response should return success");

          done();
        });
    });

    test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .put(`/api/replies/${board}`)
        .send({ thread_id, reply_id })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(
            res.body,
            "reported",
            "response should return `reported` string"
          );

          done();
        });
    });
  });
});
