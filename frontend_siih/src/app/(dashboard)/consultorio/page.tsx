"use client"
import React, { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { useAuthStore } from '@/stores/authStore'
import { fetchCurrentUserProfile } from '@/lib/auth'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal'

interface ProfileData {
  first_name?: string
  last_name?: string
  nombre_medico?: string
  especialidad?: string
  perfil?: {
    cargo?: string
  }
}

interface PacienteData {
  id_paciente?: number
  id?: number
  idPaciente?: number
  nombre?: string
  apellido?: string
  nombre_completo?: string
  edad?: number | string
  fecha_nacimiento?: string
  seguro_medico?: string
  seguro?: string
  alergias?: string | null
}

interface HistorialItem {
  fecha_registro?: string
  fecha?: string
  created_at?: string
  medico_tratante?: string
  medico_nombre?: string
  motivo_consulta?: string
  diagnostico?: string
  recetas?: unknown
}

interface MedicamentoItem {
  id_medicamento?: number
  id?: number
  nombre?: string
  nombre_comercial?: string
}

interface RecetaPendiente {
  id_medicamento: number
  nombre: string
  cantidad: number
  dosis: string
  frecuencia: string
  duracion: string
}

interface ExamenPendiente {
  tipo_examen: string
  indicaciones_medicas: string
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (isAxiosError<{ detail?: string }>(err)) {
    return err.response?.data?.detail || err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

const getEdadDesdeFechaNacimiento = (fechaNacimiento?: string) => {
  if (!fechaNacimiento) return null

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`)
  if (Number.isNaN(nacimiento.getTime())) return null

  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mesDiff = hoy.getMonth() - nacimiento.getMonth()

  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1
  }

  return edad
}

export default function ConsultorioPage() {
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [cedula, setCedula] = useState('1039485')
  const [paciente, setPaciente] = useState<PacienteData | null>(null)
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Evolución local
  const [motivo, setMotivo] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [tratamiento, setTratamiento] = useState('')
  const [idCie10] = useState<number | null>(null)

  // Recetas / examenes pendientes (local)
  const [recetasPendientes, setRecetasPendientes] = useState<RecetaPendiente[]>([])
  const [examenesPendientes, setExamenesPendientes] = useState<ExamenPendiente[]>([])

  // Modales
  const [openReceta, setOpenReceta] = useState(false)
  const [openLab, setOpenLab] = useState(false)

  // Catalogos
  const [medicamentos, setMedicamentos] = useState<MedicamentoItem[]>([])
  const [selectedMedicamento, setSelectedMedicamento] = useState<number | null>(null)
  const [medicamentoForm, setMedicamentoForm] = useState({ cantidad: 1, dosis: '', frecuencia: '', duracion: '' })
  const [labForm, setLabForm] = useState({ hemograma: true, glucosa: true, observaciones: '' })

  useEffect(() => {
    // Cargar perfil al montar
    const loadProfile = async () => {
      setLoadingProfile(true)
      try {
        const p = await fetchCurrentUserProfile()
        setProfile(p)
      } catch (err) {
        // Si falla, intentar usar store
        if (user) setProfile(user)
        console.error(err)
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [user])

  useEffect(() => {
    // precargar medicamentos cuando se abra el modal (lazy)
    if (!openReceta) return
    (async () => {
      try {
        const { data } = await api.get('/medicamentos/')
        // si viene paginado, intentar usar results
        const list = data.results || data
        setMedicamentos(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Error cargando medicamentos', err)
      }
    })()
  }, [openReceta])

  const handleConsultar = async () => {
    setError(null)
    setPaciente(null)
    setHistorial([])
    try {
      const cedulaLimpia = cedula.trim()
      if (!cedulaLimpia) throw new Error('Ingrese una cédula')

      const { data: patientData } = await api.get<PacienteData>(`/pacientes/cedula/${encodeURIComponent(cedulaLimpia)}/`)
      if (!patientData) throw new Error('Paciente no encontrado')
      setPaciente(patientData)

      // activar alerta si alergias
      // cargar historial
      const id = patientData.id_paciente || patientData.id || patientData.idPaciente
      if (!id) throw new Error('ID de paciente inválido')
      const { data: hist } = await api.get(`/pacientes/${id}/historial/`)
      const list = hist.results || hist
      setHistorial(Array.isArray(list) ? list : [])
    } catch (err: unknown) {
      console.error(err)
      setError(getErrorMessage(err, 'Error buscando paciente'))
    }
  }

  const handleAgregarReceta = () => {
    if (!selectedMedicamento) return
    const item = {
      id_medicamento: selectedMedicamento,
      nombre: medicamentos.find((m) => m.id_medicamento === selectedMedicamento)?.nombre_comercial
        || medicamentos.find((m) => m.id_medicamento === selectedMedicamento)?.nombre
        || 'Medicamento',
      ...medicamentoForm,
    }
    setRecetasPendientes((s) => [...s, item])
    setOpenReceta(false)
    // reset form
    setSelectedMedicamento(null)
    setMedicamentoForm({ cantidad: 1, dosis: '', frecuencia: '', duracion: '' })
  }

  const edadPaciente = paciente?.edad ?? getEdadDesdeFechaNacimiento(paciente?.fecha_nacimiento)

  const handleEnviarOrdenLab = () => {
    const items: Array<{ tipo_examen: string }> = []
    if (labForm.hemograma) items.push({ tipo_examen: 'Hemograma Completo' })
    if (labForm.glucosa) items.push({ tipo_examen: 'Glucosa en Sangre' })
    const mapped = items.map(i => ({ ...i, indicaciones_medicas: labForm.observaciones }))
    setExamenesPendientes((s) => [...s, ...mapped])
    setOpenLab(false)
    setLabForm({ hemograma: true, glucosa: true, observaciones: '' })
  }

  const handleGuardarEvolucion = async () => {
    setError(null)
    if (!paciente) { setError('No hay paciente seleccionado'); return }

    try {
      // Crear historial
      const payload: {
        motivo_consulta: string
        diagnostico: string
        tratamiento: string
        id_cie10?: number
      } = {
        motivo_consulta: motivo,
        diagnostico: diagnostico,
        tratamiento: tratamiento,
      }
      if (idCie10) payload.id_cie10 = idCie10

      const { data } = await api.post('/historiales/', payload)
      const id_historial = data.id_historial || data.id || data.id_historial

      // Crear recetas
      for (const r of recetasPendientes) {
        try {
          await api.post(`/historiales/${id_historial}/recetas/`, { items: [{ id_medicamento: r.id_medicamento, cantidad: r.cantidad, dosis: r.dosis, frecuencia: r.frecuencia, duracion: r.duracion }] })
        } catch (err) { console.error('Error creando receta', err); throw err }
      }

      // Crear examenes
      for (const e of examenesPendientes) {
        try {
          await api.post(`/historiales/${id_historial}/examenes/`, { tipo_examen: e.tipo_examen, indicaciones_medicas: e.indicaciones_medicas || '' })
        } catch (err) { console.error('Error creando examen', err); throw err }
      }

      // Si todo bien
      setMotivo('')
      setDiagnostico('')
      setTratamiento('')
      setRecetasPendientes([])
      setExamenesPendientes([])
      alert('Evolución Guardada')
    } catch (err: unknown) {
      console.error(err)
      setError(getErrorMessage(err, 'Error guardando evolución'))
    }
  }

  return (
    <RoleGuard allowedRoles={["Medico"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">SIIH - Consultorio Médico</h2>
          <div>
            {loadingProfile ? <span>Cargando...</span> : (
              <span>{profile ? `${profile.first_name || profile.nombre_medico || ''} ${profile.last_name || ''} - ${profile.perfil?.cargo || profile.especialidad || 'Medicina General'}` : 'Usuario'}</span>
            )}
          </div>
        </div>

        <div className="bg-card p-4 rounded-md border mb-4">
          <div className="flex gap-2">
            <Input value={cedula} onChange={(e) => setCedula(e.target.value)} />
            <Button onClick={handleConsultar}>Consultar</Button>
          </div>
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-2 rounded mb-4">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

        {paciente && (
          <div className="border p-3 rounded mb-4">
            <strong>Paciente:</strong> {paciente.nombre || paciente.nombre_completo || `${paciente.nombre} ${paciente.apellido}`} | <strong>Edad:</strong> {edadPaciente ?? 'N/D'} {typeof edadPaciente === 'number' ? 'años' : ''} | <strong>Seguro:</strong> {paciente.seguro_medico || paciente.seguro}
            {paciente.alergias && <div className="mt-2 bg-red-600 text-white p-2 rounded">ALERTA VISUAL: ALERGIAS CRÍTICAS - {paciente.alergias}</div>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Expediente Clínico</h3>
            <div className="space-y-3">
              {historial.length === 0 && <div className="text-muted">Sin registros</div>}
              {historial.map((h, idx) => (
                <div key={idx} className="border p-3 rounded bg-muted">
                  <div className="font-bold">Fecha: {h.fecha_registro || h.fecha || h.created_at} | Atendido por: {h.medico_tratante || h.medico_nombre}</div>
                  <p><strong>Motivo:</strong> {h.motivo_consulta}</p>
                  <p><strong>Diagnóstico:</strong> {h.diagnostico}</p>
                  <p><strong>Recetas Emitidas:</strong> {typeof h.recetas === 'string' ? h.recetas : JSON.stringify(h.recetas)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Nueva Evolución</h3>
            <label className="text-sm font-medium">Motivo de Consulta</label>
            <textarea className="w-full p-2 border rounded mb-2" value={motivo} onChange={e => setMotivo(e.target.value)} />

            <label className="text-sm font-medium">Diagnóstico</label>
            <textarea className="w-full p-2 border rounded mb-2" value={diagnostico} onChange={e => setDiagnostico(e.target.value)} />

            <label className="text-sm font-medium">Tratamiento e Indicaciones</label>
            <textarea className="w-full p-2 border rounded mb-2" value={tratamiento} onChange={e => setTratamiento(e.target.value)} />

            <div className="flex gap-2 mt-2">
              <Button onClick={() => setOpenReceta(true)}>+ Emitir Receta Electrónica</Button>
              <Button onClick={() => setOpenLab(true)}>+ Solicitar Orden de Laboratorio</Button>
            </div>

            <div className="mt-4">
              <div className="mb-2 font-medium">Recetas pendientes</div>
              {recetasPendientes.length === 0 && <div className="text-muted">Ninguna</div>}
              <ul className="list-disc pl-5">
                {recetasPendientes.map((r, i) => <li key={i}>{r.nombre} — {r.cantidad} — {r.dosis} — {r.frecuencia}</li>)}
              </ul>

              <div className="mt-3 mb-2 font-medium">Órdenes de Laboratorio pendientes</div>
              {examenesPendientes.length === 0 && <div className="text-muted">Ninguna</div>}
              <ul className="list-disc pl-5">
                {examenesPendientes.map((e, i) => <li key={i}>{e.tipo_examen} — {e.indicaciones_medicas}</li>)}
              </ul>
            </div>

            <div className="mt-6 text-right">
              <Button variant="destructive" onClick={handleGuardarEvolucion}>Guardar Evolución y Finalizar</Button>
            </div>
          </div>
        </div>

        {/* Modal Receta */}
        <Modal isOpen={openReceta} onClose={() => setOpenReceta(false)}>
          <ModalHeader>
            <ModalTitle>Emisión de Receta Electrónica</ModalTitle>
          </ModalHeader>
          <div>
            <label className="block mb-1">Vademécum / Medicamento</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mb-2"
              value={selectedMedicamento ?? ''}
              onChange={e => setSelectedMedicamento(Number(e.target.value))}
            >
              <option value="" className="bg-slate-900 text-slate-100">Seleccione...</option>
              {medicamentos.map((m) => (
                <option key={m.id_medicamento || m.id} value={m.id_medicamento || m.id} className="bg-slate-900 text-slate-100">
                  {m.nombre_comercial || m.nombre || `Medicamento #${m.id_medicamento || m.id}`}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label>Cantidad</label>
                <Input type="number" value={medicamentoForm.cantidad} onChange={e => setMedicamentoForm({ ...medicamentoForm, cantidad: Number(e.target.value) })} />
              </div>
              <div>
                <label>Dosis</label>
                <Input value={medicamentoForm.dosis} onChange={e => setMedicamentoForm({ ...medicamentoForm, dosis: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label>Frecuencia</label>
                <Input value={medicamentoForm.frecuencia} onChange={e => setMedicamentoForm({ ...medicamentoForm, frecuencia: e.target.value })} />
              </div>
              <div>
                <label>Duración</label>
                <Input value={medicamentoForm.duracion} onChange={e => setMedicamentoForm({ ...medicamentoForm, duracion: e.target.value })} />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button onClick={() => setOpenReceta(false)}>Cancelar</Button>
            <Button onClick={handleAgregarReceta}>Agregar a Receta</Button>
          </ModalFooter>
        </Modal>

        {/* Modal Laboratorio */}
        <Modal isOpen={openLab} onClose={() => setOpenLab(false)}>
          <ModalHeader>
            <ModalTitle>Solicitud de Exámenes (Laboratorio)</ModalTitle>
          </ModalHeader>
          <div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={labForm.hemograma} onChange={e => setLabForm({ ...labForm, hemograma: e.target.checked })} /> Hemograma Completo</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={labForm.glucosa} onChange={e => setLabForm({ ...labForm, glucosa: e.target.checked })} /> Glucosa en Sangre</label>
            <label className="block mt-2">Observaciones para el Técnico</label>
            <textarea className="w-full p-2 border rounded" value={labForm.observaciones} onChange={e => setLabForm({ ...labForm, observaciones: e.target.value })} />
          </div>
          <ModalFooter>
            <Button onClick={() => setOpenLab(false)}>Cancelar</Button>
            <Button onClick={handleEnviarOrdenLab}>Enviar Orden a Laboratorio</Button>
          </ModalFooter>
        </Modal>

      </div>
    </RoleGuard>
  )
}
