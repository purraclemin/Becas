"use client"

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

// 1. Configuración de Estilos (Tailwind para PDF)
const tw = createTw({
  theme: {
    extend: {
      colors: {
        unimarBlue: '#1e3a5f',
        unimarGold: '#d4a843',
        grayLight: '#f3f4f6',
      },
    },
  },
});

// 2. Componente del Documento (El "Molde")
export const PlanillaSolicitud = ({ user, promedio }: { user: any, promedio: string }) => (
  <Document title={`Planilla_Beca_${user?.cedula || 'UNIMAR'}`}>
    <Page size="LETTER" style={tw('p-8 font-sans text-[#1e3a5f]')}>
      
      {/* --- CABECERA --- */}
      <View style={tw('flex flex-row justify-between items-center border-b-2 border-unimarGold pb-4 mb-4')}>
        <View style={tw('flex flex-col')}>
            <Text style={tw('text-lg font-black tracking-widest text-unimarBlue')}>UNIMAR</Text>
            <Text style={tw('text-[8px] font-bold text-gray-500 uppercase tracking-widest')}>Universidad de Margarita</Text>
            <Text style={tw('text-[8px] text-gray-400')}>Dirección de Bienestar Estudiantil</Text>
        </View>
        <View style={tw('items-end')}>
            <Text style={tw('text-[8px] text-gray-400 mb-1')}>Código de Expediente</Text>
            <Text style={tw('bg-gray-100 text-unimarBlue px-2 py-1 text-[9px] font-bold rounded')}>
                {user?.id?.slice(0, 8).toUpperCase() || 'PENDIENTE'}
            </Text>
        </View>
      </View>

      <Text style={tw('text-center text-xs font-black uppercase tracking-widest mb-6 text-unimarBlue')}>
        Solicitud de Beneficio Socioeconómico
      </Text>

      {/* --- BLOQUE 1: DATOS PERSONALES --- */}
      <View style={tw('mb-4 border border-gray-200 rounded overflow-hidden')}>
        <View style={tw('bg-gray-100 p-2 border-b border-gray-200')}>
            <Text style={tw('text-[8px] font-black uppercase tracking-wider text-unimarBlue')}>1. Datos del Estudiante</Text>
        </View>
        <View style={tw('p-2 flex flex-row flex-wrap')}>
            <View style={tw('w-1/2 mb-2')}>
                <Text style={tw('text-[7px] text-gray-400 uppercase')}>Nombre Completo</Text>
                <Text style={tw('text-[9px] font-bold')}>{user?.nombre} {user?.apellido}</Text>
            </View>
            <View style={tw('w-1/2 mb-2')}>
                <Text style={tw('text-[7px] text-gray-400 uppercase')}>Cédula de Identidad</Text>
                <Text style={tw('text-[9px] font-bold')}>{user?.cedula}</Text>
            </View>
            <View style={tw('w-1/2 mb-2')}>
                <Text style={tw('text-[7px] text-gray-400 uppercase')}>Carrera</Text>
                <Text style={tw('text-[9px] font-bold')}>{user?.carrera || 'No Registrada'}</Text>
            </View>
            <View style={tw('w-1/2 mb-2')}>
                <Text style={tw('text-[7px] text-gray-400 uppercase')}>Promedio Actual</Text>
                <Text style={tw('text-[9px] font-bold text-unimarGold')}>{promedio} pts</Text>
            </View>
        </View>
      </View>

      {/* --- BLOQUE 2: CARGA ACADÉMICA --- */}
      <View style={tw('mb-4 border border-gray-200 rounded overflow-hidden')}>
        <View style={tw('bg-gray-100 p-2 border-b border-gray-200')}>
            <Text style={tw('text-[8px] font-black uppercase tracking-wider text-unimarBlue')}>2. Carga Académica Reportada</Text>
        </View>
        {/* Encabezados de Tabla */}
        <View style={tw('flex flex-row bg-gray-50 border-b border-gray-100 p-1')}>
            <Text style={tw('w-3/4 text-[7px] font-bold uppercase text-gray-500 pl-2')}>Asignatura</Text>
            <Text style={tw('w-1/4 text-[7px] font-bold uppercase text-gray-500 text-center')}>Calificación</Text>
        </View>
        {/* Filas */}
        {(user?.materias_registradas || []).map((m: any, i: number) => (
            <View key={i} style={tw(`flex flex-row p-1 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`)}>
                <Text style={tw('w-3/4 text-[8px] pl-2 text-gray-700')}>{m.nombre}</Text>
                <Text style={tw('w-1/4 text-[8px] font-bold text-center text-unimarBlue')}>{m.nota}</Text>
            </View>
        ))}
      </View>

      {/* --- BLOQUE 3: RESUMEN FINANCIERO --- */}
      <View style={tw('flex flex-row gap-4 mb-8')}>
        <View style={tw('flex-1 border border-emerald-100 bg-emerald-50/30 rounded p-2')}>
            <Text style={tw('text-[7px] text-emerald-600 font-bold uppercase mb-1')}>Ingreso Familiar Mensual</Text>
            <Text style={tw('text-xs font-black text-emerald-800')}>Bs. {user?.monto_ingreso_sueldo || '0.00'}</Text>
        </View>
        <View style={tw('flex-1 border border-rose-100 bg-rose-50/30 rounded p-2')}>
            <Text style={tw('text-[7px] text-rose-600 font-bold uppercase mb-1')}>Egreso Familiar Mensual</Text>
            <Text style={tw('text-xs font-black text-rose-800')}>Bs. {user?.monto_egreso_mercado || '0.00'}</Text>
        </View>
      </View>

      {/* --- PIE DE PÁGINA (FIRMAS) --- */}
      <View style={tw('absolute bottom-12 left-8 right-8 flex flex-row justify-between items-end')}>
        <View style={tw('w-1/3 border-t border-gray-300 pt-2')}>
            <Text style={tw('text-[7px] text-center font-bold text-gray-400 uppercase')}>Firma del Estudiante</Text>
        </View>
        <View style={tw('w-1/3 border-t border-gray-300 pt-2')}>
            <Text style={tw('text-[7px] text-center font-bold text-gray-400 uppercase')}>Sello Recepción UNIMAR</Text>
        </View>
      </View>

      <Text style={tw('absolute bottom-4 left-0 right-0 text-center text-[6px] text-gray-300')}>
        Generado electrónicamente el {new Date().toLocaleDateString()} | Sistema de Gestión de Becas
      </Text>

    </Page>
  </Document>
);