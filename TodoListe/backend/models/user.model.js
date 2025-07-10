// On importe Mongoose, un outil pour interagir facilement avec MongoDB
const mongoose = require("mongoose");

// On définit un **schéma** pour les utilisateurs : cela décrit la structure d'un document "User" dans la base MongoDB
const userSchema = new mongoose.Schema({
  // Le nom d'utilisateur est une chaîne de caractères, obligatoire et doit être unique
  username: { type: String, required: true, unique: true },

  // L'email est aussi une chaîne, obligatoire et unique (pour éviter les doublons)
  email:    { type: String, required: true, unique: true },

  // Le mot de passe est une chaîne obligatoire (mais on ne le rend pas unique ici car deux personnes peuvent avoir le même mot de passe par hasard)
  password: { type: String, required: true }
});

// On exporte le modèle "User" basé sur le schéma défini. Il sera utilisé pour créer, lire, mettre à jour ou supprimer des utilisateurs dans la base.
module.exports = mongoose.model("User", userSchema);
