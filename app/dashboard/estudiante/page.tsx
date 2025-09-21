"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, LogOut, Calendar, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

// Datos simulados del estudiante
const studentData = {
  nombre: "Juan Carlos",
  apellidos: "Pérez González",
  numeroControl: "20240001",
  carrera: "Ingeniería Electrónica",
  semestre: "5to Semestre",
}

const misSolicitudes = [
  {
    id: 1,
    material: "Resistencias 1/4W",
    cantidad: 10,
    fechaSolicitud: "2024-01-15",
    estado: "pendiente",
    motivo: "Práctica de circuitos básicos",
  },
  {
    id: 2,
    material: "Capacitores Electrolíticos",
    cantidad: 5,
    fechaSolicitud: "2024-01-10",
    estado: "aprobado",
    motivo: "Proyecto de fuente de alimentación",
    fechaAprobacion: "2024-01-12",
  },
  {
    id: 3,
    material: "Multímetros Digitales",
    cantidad: 1,
    fechaSolicitud: "2024-01-08",
    estado: "rechazado",
    motivo: "Medición de voltajes",
    fechaRespuesta: "2024-01-09",
    razonRechazo: "No hay disponibilidad suficiente",
  },
]


// Materiales disponibles en el laboratorio de Electrónica Analógica
const materiales = [
  {
    id: 1,
    nombre: "Resistencias 1/4W",
    descripcion: "Resistencias de película de carbono de diversos valores",
    cantidadDisponible: 200,
    unidad: "piezas",
  },
  {
    id: 2,
    nombre: "Capacitores Electrolíticos",
    descripcion: "Capacitores de diferentes valores (10uF, 100uF, 470uF)",
    cantidadDisponible: 150,
    unidad: "piezas",
  },
  {
    id: 3,
    nombre: "Protoboards",
    descripcion: "Placas de prueba de 830 puntos para montaje de circuitos",
    cantidadDisponible: 25,
    unidad: "piezas",
  },
  {
    id: 4,
    nombre: "Amplificadores Operacionales LM741",
    descripcion: "Circuitos integrados para prácticas de amplificación",
    cantidadDisponible: 50,
    unidad: "piezas",
  },
  {
    id: 5,
    nombre: "Transistores BJT (2N3904, 2N3906)",
    descripcion: "Transistores NPN y PNP para prácticas de amplificación y conmutación",
    cantidadDisponible: 100,
    unidad: "piezas",
  },
]


// Asesorías disponibles
const asesorias = [
  {
    id: 1,
    titulo: "Análisis de Circuitos con SPICE",
    docente: "Dr. María López",
    fecha: "2024-01-15",
    hora: "14:00-16:00",
    cupos: 8,
    ocupados: 5,
    descripcion: "Simulación de circuitos eléctricos usando herramientas SPICE",
  },
  {
    id: 2,
    titulo: "Diseño de PCB con KiCad",
    docente: "Ing. Carlos Ruiz",
    fecha: "2024-01-18",
    hora: "10:00-12:00",
    cupos: 10,
    ocupados: 10,
    descripcion: "Diseño de circuitos impresos desde esquemático hasta fabricación",
  },
  {
    id: 3,
    titulo: "Programación de Microcontroladores",
    docente: "Dr. Ana Martínez",
    fecha: "2024-01-20",
    hora: "16:00-18:00",
    cupos: 12,
    ocupados: 7,
    descripcion: "Introducción a la programación de microcontroladores Arduino y PIC",
  },
]

export default function DashboardEstudiante() {
  const [selectedMateria, setSelectedMateria] = useState<number | null>(null)

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "aprobado":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rechazado":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "aprobado":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Aprobado
          </Badge>
        )
      case "rechazado":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/5">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {studentData.nombre} {studentData.apellidos}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {studentData.numeroControl} - {studentData.carrera}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{studentData.semestre}</Badge>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="material" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="material">Material Disponible</TabsTrigger>
            <TabsTrigger value="solicitudes">Mis Solicitudes</TabsTrigger>
            <TabsTrigger value="asesorias">Asesorías</TabsTrigger>
          </TabsList>

          <TabsContent value="material" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Material de Laboratorio</h2>
              <p className="text-muted-foreground mb-6">
                Consulta el material disponible para préstamo en el laboratorio de electrónica
              </p>
            </div>

          <div className="grid md:grid-cols-2 gap-6">
  {materiales.map((material) => (
    <Card
      key={material.id}
      className="hover:shadow-lg transition-all duration-300"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{material.nombre}</CardTitle>
              <CardDescription>{material.descripcion}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">
            {material.cantidadDisponible} {material.unidad}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="sm">
          Solicitar Préstamo
        </Button>
      </CardContent>
    </Card>
  ))}
</div>

          </TabsContent>

          <TabsContent value="solicitudes" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Mis Solicitudes de Préstamo</h2>
              <p className="text-muted-foreground mb-6">Revisa el estado de tus solicitudes de préstamo de material</p>
            </div>

            {misSolicitudes.length > 0 ? (
              <div className="space-y-4">
                {misSolicitudes.map((solicitud) => (
                  <Card key={solicitud.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            {getEstadoIcon(solicitud.estado)}
                            <div>
                              <h4 className="font-semibold text-foreground">{solicitud.material}</h4>
                              <p className="text-sm text-muted-foreground">Cantidad: {solicitud.cantidad} unidades</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Fecha de solicitud:</p>
                              <p className="font-medium">{solicitud.fechaSolicitud}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Motivo:</p>
                              <p className="font-medium">{solicitud.motivo}</p>
                            </div>
                            {solicitud.estado === "aprobado" && solicitud.fechaAprobacion && (
                              <div>
                                <p className="text-muted-foreground">Fecha de aprobación:</p>
                                <p className="font-medium text-green-600">{solicitud.fechaAprobacion}</p>
                              </div>
                            )}
                            {solicitud.estado === "rechazado" && solicitud.razonRechazo && (
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Razón del rechazo:</p>
                                <p className="font-medium text-red-600">{solicitud.razonRechazo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getEstadoBadge(solicitud.estado)}
                          {solicitud.estado === "aprobado" && (
                            <Button size="sm" variant="outline">
                              Recoger Material
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No tienes solicitudes de préstamo</h3>
                  <p className="text-muted-foreground">
                    Ve a la sección "Material Disponible" para solicitar préstamos
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="asesorias" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Asesorías Disponibles</h2>
              <p className="text-muted-foreground mb-6">Inscríbete a las asesorías programadas por los docentes</p>
            </div>

            <div className="grid gap-6">
              {asesorias.map((asesoria) => (
                <Card key={asesoria.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/10 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{asesoria.titulo}</CardTitle>
                          <CardDescription>Impartida por {asesoria.docente}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={asesoria.ocupados < asesoria.cupos ? "default" : "secondary"}>
                        {asesoria.ocupados}/{asesoria.cupos} cupos
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{asesoria.descripcion}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">📅 {asesoria.fecha}</span>
                        <span className="text-muted-foreground">🕐 {asesoria.hora}</span>
                      </div>
                      <div className="mt-4">
                        <Button className="w-full" size="sm" disabled={asesoria.ocupados >= asesoria.cupos}>
                          {asesoria.ocupados >= asesoria.cupos ? "Cupos Agotados" : "Inscribirse"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
