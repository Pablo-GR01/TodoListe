const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/todolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connecté"))
  .catch((err) => console.error("Erreur MongoDB", err));

// Routes
app.use("/api/users", userRoutes);

// Démarrage serveur
app.listen(3000, () => {
  console.log("Serveur backend sur http://localhost:3000");
});
