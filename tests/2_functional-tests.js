const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const board = "freecodecamp";

  suite("TEST request to /api/threads/{board}", () => {
    test("Create a new thread: POST request to /api/threads/{board}", (done) => {
      const delete_password = "123";
      const text = "Thread 1";

      chai
        .request(server)
        .post(`/api/threads/${board}`)
        .send({ delete_password, text })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          //TODO

          done();
        });
    });

    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .get(`/api/threads/${board}`)
        .query({})
        .end((_err, res) => {
          assert.equal(res.status, 200);
          //TODO

          done();
        });
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}", (done) => {
        const thread_id = "";
        const delete_password = "";
  
      chai
        .request(server)
        .delete(`/api/threads/${board}`)
        .send({ board, thread_id, delete_password })
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
      const thread_id = "";
      const delete_password = "";

      chai
        .request(server)
        .delete(`/api/threads/${board}`)
        .send({ board, thread_id, delete_password })
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

    test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
      const thread_id = "";

      chai
        .request(server)
        .put(`/api/threads/${board}`)
        .send({ board, thread_id })
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

  suite("TEST request to /api/replies/{board}", () => {
    test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
      const board = "";

      chai
        .request(server)
        .post(`/api/replies/${board}`)
        .send({})
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.containsAllKeys(res.body, [
            "bumped_on",
            "created_on",
            "delete_password",
            "replies",
            "reported",
            "text",
            "_id",
          ]);
          assert.isArray(
            res.body.replies,
            "response should have a property replies as an array"
          );
          assert.isAtLeast(
            res.body.replies.length,
            1,
            "response should have at least one reply"
          );

          replies.forEach((reply) => {
            assert.containsAllKeys(reply.body, [
              "created_on",
              "delete_password",
              "reported",
              "text",
              "_id",
            ]);
          });

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

          done();
        });
    });

    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
      const board = "";
      const thread_id = "";

      chai
        .request(server)
        .get(`/api/replies/${board}`)
        .query({ thread_id })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          //TODO
          done();
        });
    });

    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}", (done) => {
      const board = "";
      const thread_id = "";
      const reply_id = "";
      const delete_password = "";

      chai
        .request(server)
        .delete(`/api/replies/${board}`)
        .send({ thread_id, reply_id, delete_password })
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
      const board = "";
      const thread_id = "";
      const reply_id = "";
      const delete_password = "";

      chai
        .request(server)
        .delete(`/api/replies/${board}`)
        .send({ thread_id, reply_id, delete_password })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, "success", "response should return success");

          done();
        });
    });

    test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
      const thread_id = "";
      const reply_id = "";

      chai
        .request(server)
        .put(`/api/replies/${board}`)
        .send({ board, thread_id, reply_id })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.equal(
            res.body,
            "reported",
            "response should return reported string"
          );
          done();
        });
    });
  });
});
