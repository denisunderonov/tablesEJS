// index.js

const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const ejs = require("ejs");
const methodOverride = require("method-override");

const app = express();
const port = 4555;

// Подключение промежуточного программного обеспечения method-override
app.use(methodOverride("_method"));

// Настройка подключения к базе данных PostgreSQL
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Denimz13",
  port: 5432,
});

// Middleware для обработки тела запроса в формате JSON и URL-кодирования
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Настройка шаблонизатора EJS
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Отображение главной страницы
app.get("/", async (req, res) => {
  try {
    const books = await pool.query("SELECT * FROM Книги");
    const issues = await pool.query("SELECT * FROM Выдачи");

    res.render("index", { books: books.rows, issues: issues.rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Отображение формы для добавления книги
app.get("/addBook", (req, res) => {
  res.render("addBook");
});

// Обработка POST-запроса для добавления книги
app.post("/addBook", async (req, res) => {
  const { isbn, title, author, price, year } = req.body;

  try {
    await pool.query(
      "INSERT INTO Книги (ISBN, Название, Автор, Цена_книги, Год_издания) VALUES ($1, $2, $3, $4, $5)",
      [isbn, title, author, price, year]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Отображение формы для обновления книги
app.get("/updateBook/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = await pool.query("SELECT * FROM Книги WHERE isbn = $1", [
      isbn,
    ]);
    res.render("updateBook", { book: book.rows[0] });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/reports', async (req, res) => {
    try {
      const reportQuery = 'SELECT * FROM Отчет';
      const totalPriceQuery = 'SELECT SUM(Цена_книги) AS total_price FROM Отчет';
  
      const [reportResult, totalPriceResult] = await Promise.all([
        pool.query(reportQuery),
        pool.query(totalPriceQuery),
      ]);
  
      const totalPrice = totalPriceResult.rows[0].total_price || 0;
  
      res.render('reports', { reports: reportResult.rows, totalPrice });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).send('Internal Server Error');
    }
  });
// Обработка POST-запроса для обновления книги
app.post("/updateBook/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  const { title, author, genre, price, year } = req.body;

  try {
    await pool.query(
      "UPDATE Книги SET Название = $1, Автор = $2, Год_издания = $3, Жанр = $4, Цена_книги = $5 WHERE isbn = $5",
      [title, author, year, genre, price, isbn]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Отображение формы для добавления выдачи
app.get("/addIssue", (req, res) => {
  res.render("addIssue");
});

// Обработка POST-запроса для добавления выдачи
app.post("/addIssue", async (req, res) => {
  const { readerId, isbn, librarianId, issueDate, returnDate } = req.body;

  try {
    await pool.query(
      "INSERT INTO Выдачи (id_читателя, isbn, id_библиотекаря, Дата_выдачи, Дата_возврата) VALUES ($1, $2, $3, $4, $5)",
      [readerId, isbn, librarianId, issueDate, returnDate]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Отображение формы для обновления выдачи
app.get("/updateIssue/:isbn", async (req, res) => {
  const id = req.params.isbn;

  try {
    const issue = await pool.query("SELECT * FROM Выдачи WHERE isbn = $1", [
      id,
    ]);
    res.render("updateIssue", { issue: issue.rows[0] });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Обработка POST-запроса для обновления выдачи
app.post("/updateIssue/:id", async (req, res) => {
  const id = req.params.id;
  const { readerId, isbn, librarianId, issueDate, returnDate } = req.body;

  try {
    await pool.query(
      "UPDATE Выдачи SET id_читателя = $1, ISBN = $2, id_библиотекаря = $3, Дата_выдачи = $4, Дата_возврата = $5 WHERE id_выдачи = $6",
      [readerId, isbn, librarianId, issueDate, returnDate, id]
    );
    res.redirect("/");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Обработка POST-запроса для удаления выдачи
app.delete("/deleteIssue/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    await pool.query("DELETE FROM Выдачи WHERE isbn = $1", [isbn]);
    res.redirect("/");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Internal Server Error");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
