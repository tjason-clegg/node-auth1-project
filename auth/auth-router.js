const router = require("express").Router();
const Users = require("../users/users-model");

const bcrypt = require("bcryptjs");

router.post("/register", (req, res) => {
  const rounds = process.env.HASH_ROUNDS || 4;

  const hash = bcrypt.hashSync(req.body.password, rounds);

  req.body.password = hash;

  Users.add(req.body)
    .then((saved) => {
      res.status(201).json({ data: saved });
    })

    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  Users.findBy({ username })
    .then((users) => {
      const user = users[0];
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.loggedIn = true;
        req.session.username = user.username;
        res.status(200).json({ message: "welcome" });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.status(204).end();
  } else {
    res.status(200).json({ message: "already logged out" });
  }
});

module.exports = router;
