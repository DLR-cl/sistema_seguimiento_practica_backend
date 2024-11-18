import { Tipo_usuario } from "@prisma/client";

declare namespace Express {
    interface Request {
      id_usuario: string;
      correo: string;
      nombre: string;
      rut: string;
      tipo_usuario: Tipo_usuario;
    }
  }