import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/miProyecto")
  .then(() => console.log("🔥 Conectado a MongoDB"))
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));
