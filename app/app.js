const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const dbPath = "app/db/database.sqlite3";
const path = require("path");
const bodyParser = require("body-parser");

// リクエストのbodyを読取
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// publicを静的ルートディレクトリとして扱う
app.use(express.static(path.join(__dirname, "public")));

// Get all users
app.get("/api/v1/users", (req, res) => {
  // Connect database
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT * FROM users", (err, rows) => {
    res.json(rows);
  });

  db.close();
});

// Get user
app.get("/api/v1/users/:id", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const id = req.params.id;

  db.get(`SELECT * FROM users WHERE id=${id}`, (err, row) => {
    if (!row) {
      // 404 = not found
      res.status(404).send({ error: "selected user not found" });
    } else {
      // 200 = success
      res.status(200).json(row);
    }
  });

  db.close();
});

// Search users keyword
app.get("/api/v1/search", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  // ?q=・・・
  const keyword = req.query.q;

  db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err, rows) => {
    res.json(rows);
  });

  db.close();
});

const run = async (sql, db) => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
};

// Create new user
app.post("/api/v1/users", async (req, res) => {
  if (!req.body.name || req.body.name === "") {
    // 400 = bad request
    res.status(400).send({ error: "name not specified" });
  } else {
    const db = new sqlite3.Database(dbPath);

    const name = req.body.name;
    const profile = req.body.profile ? req.body.profile : "";
    const birth = req.body.date_of_birth ? req.body.date_of_birth : "";

    try {
      await run(
        `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}", "${profile}", "${birth}")`,
        db
      );
      // 201 = create success
      res.status(201).send({ message: "new user created!" });
    } catch (e) {
      // 500 = sever error
      res.status(500).send({ error: e });
    }

    db.close();
  }
});

// Update user
app.put("/api/v1/users/:id", async (req, res) => {
  if (!req.body.name || req.body.name === "") {
    res.status(400).send({ error: "name not specified" });
  } else {
    const db = new sqlite3.Database(dbPath);
    const id = req.params.id;

    // 現在のユーザー情報を取得
    db.get(`SELECT * FROM users WHERE id=${id}`, async (err, row) => {
      if (!row) {
        res.status(404).send({ error: "selected user not found" });
      } else {
        const name = req.body.name ? req.body.name : row.name;
        const profile = req.body.profile ? req.body.profile : row.profile;
        const birth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth;

        try {
          await run(
            `UPDATE users SET name="${name}", profile="${profile}", date_of_birth="${birth}" WHERE id=${id}`,
            db
          );
          res.status(200).send({ message: "selected user updated!" });
        } catch (e) {
          res.status(500).send({ error: e });
        }
      }
    });

    db.close();
  }
});

// Delete user
app.delete("/api/v1/users/:id", async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const id = req.params.id;

  db.get(`SELECT * FROM users WHERE id=${id}`, async (err, row) => {
    if (!row) {
      res.status(404).send({ error: "selected user not found" });
    } else {
      try {
        await run(`DELETE FROM users WHERE id=${id}`, db);
        res.status(200).send({ message: "selected user deleted!" });
      } catch (e) {
        res.status(500).send({ error: e });
      }
    }
  });

  db.close();
});

const port = process.env.PORT || 3000;
app.listen(port);
console.log("http://localhost:" + port);
