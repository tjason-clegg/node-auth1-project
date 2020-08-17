const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const usersRouter = require("../users/users-router");
const authRouter = require("../auth/auth-router");
const dbConnection = require("../database/connection");

const authenticate = require("../auth/authentication-middleware");

const server = express();

const sessionConfiguration = {
  name: "cookie", //default value is sid --> session id
  secret: process.env.SESSION_SECRET || "keep it secret, keep it safe", //key for encryption
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: process.env.USE_SECURE_COOKIES || false, //send the cookie only over https (secure connections)
    htttpOnly: true, // prevent JS code on client from accessing this cookie; ALWAYS true
    userId: 3,
  },
  resave: false, //if there are no changes, should I still save it?
  saveUninitialized: true, //read docs, its related to GDPR compliance
  store: new KnexSessionStore({
    knex: dbConnection, //how can I connect to the database to save things there?
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true, //if table doesnt exist, create it
    clearInterval: 1000 * 60 * 30, // time to check and remove expired sessions from database --> every 30 mins in this case
  }),
};

server.use(session(sessionConfiguration));
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/users", authenticate, usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
