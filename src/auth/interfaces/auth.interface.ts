export interface AuthTokenResult {
    id_usuario:   number;
    correo:       string;
    nombre:       string;
    rut:          string;
    tipo_usuario: string;
    iat:          number;
    exp:          number;
}

export interface IUseToken {
    id_usuario:   number;
    correo:       string;
    nombre:       string;
    rut:          string;
    tipo_usuario: string;
    isExpired:      boolean;
}

