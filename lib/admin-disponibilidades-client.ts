"use server"

import { upsertDisponibilidade as upsertServer } from "./admin-disponibilidades"
import { listAdminDisponibilidades as listServer } from "./admin-disponibilidades"

// Server Action Wrapper para usar no Client Side
export async function upsertDisponibilidade(data: any) {
  return await upsertServer(data, 'admin-user') // TODO: pegar user da sessão real
}

export async function listDisponibilidades(filters: any) {
  const result = await listServer(filters)
  // Serializar para evitar erro de Date object se houver
  return JSON.parse(JSON.stringify(result))
}
