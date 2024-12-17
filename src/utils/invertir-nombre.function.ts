export function invertirYCapitalizarNombre(nombreCompleto: string): string {
    if (!nombreCompleto) return nombreCompleto;
  
    const partes = nombreCompleto.trim().split(' '); // Dividir el nombre en partes
    const cantidadPartes = partes.length;
  
    if (cantidadPartes < 3) {
      // Si no tiene suficientes partes, retornar sin cambios
      return nombreCompleto;
    }
  
    const nombres = partes.slice(2); // Extraer los nombres (después de las dos primeras partes)
    const apellidos = partes.slice(0, 2); // Extraer los dos apellidos (primeras partes)
  
    // Función para capitalizar cada palabra
    const capitalizar = (palabra: string) => 
      palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
  
    // Reorganizar y capitalizar
    const nombresCapitalizados = nombres.map(capitalizar).join(' ');
    const apellidosCapitalizados = apellidos.map(capitalizar).join(' ');
  
    return `${nombresCapitalizados} ${apellidosCapitalizados}`;
  }
  