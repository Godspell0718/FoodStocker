import dotenv from "dotenv";
import db from "./database/db.js";
import ResponsableService from "./services/responsableservice.js";

dotenv.config();

async function createAdmin() {
  try {
    await db.authenticate();
    console.log("Conectado a la base de datos.");
    
    const adminData = {
      Nom_Responsable: "Admin FoodStocker",
      Tip_Responsable: "I",
      Tel_Responsable: "0000000000",
      Doc_Responsable: "123456789",
      Cor_Responsable: "admin@foodstocker.com",
      Contraseña: "admin"
    };

    const result = await ResponsableService.register(adminData);
    console.log("Usuario administrador creado con éxito:");
    console.log(`Correo: ${adminData.Cor_Responsable}`);
    console.log(`Contraseña: ${adminData.Contraseña}`);
  } catch (error) {
    console.error("Error al crear usuario:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
