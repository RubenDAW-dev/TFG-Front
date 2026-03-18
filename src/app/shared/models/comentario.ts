export interface ComentarioResponseDTO {
  id: number;
  titulo: string;
  comentario: string;
  fecha: string;
  usuarioId: number;
  usuarioNombre: string;
  partidoId?: number;
  equipoId?: string;
  jugadorId?: string;
  targetNombre?: string;
  comentarioPadreId?: number;
  respuestas?: ComentarioResponseDTO[];
  totalRespuestas: number;
}

export interface CrearComentarioDTO {
  titulo?: string;
  comentario: string;
  usuarioId: number;
  partidoId?: number;
  equipoId?: string;
  jugadorId?: string;
  comentarioPadreId?: number;
}