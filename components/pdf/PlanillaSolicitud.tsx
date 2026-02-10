"use client"

import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

// 1. REGISTRAR LA FUENTE ROBOTO
const fonts = [
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-black-webfont.ttf', fontWeight: 900 },
];

Font.register({ family: 'Roboto', fonts: fonts });
Font.register({ family: 'ui-sans-serif', fonts: fonts });

// 2. CONFIGURACIÓN DE TAILWIND
const tw = createTw({
  theme: {
    fontFamily: { sans: ['Roboto', 'ui-sans-serif'] },
    extend: {
      colors: {
        unimarBlue: '#1e3a5f',
        unimarGold: '#d4a843',
        grayLight: '#f3f4f6',
      },
    },
  },
});

// Componentes auxiliares para el diseño
const DataRow = ({ label, value, width = "100%" }: { label: string, value: any, width?: string }) => (
  <View style={[tw(`mb-2 px-1`), { width }]}>
    <Text style={tw('text-[6px] text-gray-400 uppercase font-black')}>{label}</Text>
    <Text style={tw('text-[8px] font-medium text-slate-800')}>{value || '---'}</Text>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={tw('bg-slate-100 p-1 mb-2 border-l-2 border-unimarGold')}>
    <Text style={tw('text-[7px] font-black uppercase text-unimarBlue tracking-wider')}>{title}</Text>
  </View>
);

// 3. DOCUMENTO PDF COMPLETO
export const PlanillaSolicitud = ({ user, promedio }: { user: any, promedio: string }) => {
  
  // Lógica de sumatoria basada en SeccionesEncuesta.tsx
  const totalIngresosNum = (
    Number(user?.monto_ingreso_sueldo || 0) +
    Number(user?.monto_ingreso_extra || 0) +
    Number(user?.monto_ingreso_pension || 0) +
    Number(user?.monto_ingreso_ayuda || 0)
  );

  const totalEgresosNum = (
    Number(user?.monto_egreso_mercado || 0) +
    Number(user?.monto_egreso_vivienda || 0) +
    Number(user?.monto_egreso_salud || 0) +
    Number(user?.monto_egreso_servicios || 0)
  );

  const totalIngresos = totalIngresosNum.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const totalEgresos = totalEgresosNum.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <Document title={`Planilla_Beca_${user?.cedula || 'UNIMAR'}`}>
      <Page size="LETTER" style={tw('p-10 font-sans text-[#1e3a5f]')}>
        
        {/* CABECERA */}
        <View style={tw('flex flex-row justify-between items-center border-b-2 border-unimarGold pb-4 mb-4')}>
          <View style={tw('flex flex-col')}>
            <Text style={tw('text-xl font-black tracking-widest text-unimarBlue')}>UNIMAR</Text>
            <Text style={tw('text-[8px] font-bold text-gray-500 uppercase tracking-widest')}>Universidad de Margarita</Text>
            <Text style={tw('text-[8px] text-gray-400')}>Dirección de Bienestar Estudiantil</Text>
          </View>
          <View style={tw('items-end')}>
            <Text style={tw('text-[7px] text-gray-400 mb-1')}>CÓDIGO DE EXPEDIENTE</Text>
            <Text style={tw('bg-slate-900 text-white px-3 py-1 text-[10px] font-black rounded')}>
              {user?.id?.slice(0, 8).toUpperCase() || 'PENDIENTE'}
            </Text>
          </View>
        </View>

        <Text style={tw('text-center text-[10px] font-black uppercase tracking-widest mb-6 text-unimarBlue border-b border-slate-100 pb-2')}>
          Planilla Oficial de Solicitud de Beneficio Socioeconómico
        </Text>

        {/* 1. IDENTIFICACIÓN Y LABORAL */}
        <SectionHeader title="1. Identificación del Solicitante" />
        <View style={tw('flex flex-row flex-wrap mb-2')}>
          <DataRow width="33%" label="Nombres" value={user?.socio_nombres || user?.nombre} />
          <DataRow width="33%" label="Apellidos" value={user?.socio_apellidos || user?.apellido} />
          <DataRow width="33%" label="Cédula" value={user?.socio_cedula || user?.cedula} />
          <DataRow width="25%" label="F. Nacimiento" value={user?.socio_fecha_nac} />
          <DataRow width="25%" label="Edad" value={user?.socio_edad} />
          <DataRow width="25%" label="Estado Civil" value={user?.socio_estado_civil} />
          <DataRow width="25%" label="Sexo" value={user?.socio_sexo} />
          <DataRow width="100%" label="Dirección" value={user?.socio_direccion} />
        </View>
        {user?.socio_trabajo_empresa && (
          <View style={tw('bg-slate-50 p-2 rounded mb-4 flex flex-row flex-wrap')}>
            <DataRow width="50%" label="Empresa" value={user?.socio_trabajo_empresa} />
            <DataRow width="25%" label="Cargo" value={user?.socio_trabajo_cargo} />
            <DataRow width="25%" label="Sueldo" value={`$ ${user?.socio_trabajo_sueldo}`} />
          </View>
        )}

        {/* 2. INFORMACIÓN ACADÉMICA */}
        <SectionHeader title="2. Información Académica" />
        <View style={tw('flex flex-row flex-wrap mb-4')}>
          <DataRow width="50%" label="Carrera" value={user?.socio_carrera || user?.carrera} />
          <DataRow width="25%" label="Trimestre" value={user?.socio_trimestre} />
          <DataRow width="25%" label="Modalidad" value={user?.socio_modalidad === 'P' ? 'Presencial' : 'Otras'} />
          <DataRow width="50%" label="U.E. Procedencia" value={user?.socio_ue_procedencia} />
          <DataRow width="25%" label="Promedio Actual" value={`${promedio} pts`} />
          <DataRow width="25%" label="Estatus Beca" value={user?.estatusBeca || 'NINGUNO'} />
        </View>

        {/* 3. MATERIAS */}
        <SectionHeader title="3. Carga Académica Reportada" />
        <View style={tw('mb-4 border border-slate-100 rounded')}>
          <View style={tw('flex flex-row bg-slate-50 p-1')}>
            <Text style={tw('w-4/5 text-[7px] font-black text-slate-500 pl-2')}>ASIGNATURA</Text>
            <Text style={tw('w-1/5 text-[7px] font-black text-slate-500 text-center')}>NOTA</Text>
          </View>
          {(user?.materias_registradas || []).map((m: any, i: number) => (
            <View key={i} style={tw(`flex flex-row p-1 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`)}>
              <Text style={tw('w-4/5 text-[8px] pl-2')}>{m.nombre}</Text>
              <Text style={tw('w-1/5 text-[8px] font-bold text-center')}>{m.nota}</Text>
            </View>
          ))}
        </View>

        {/* 4. ENTORNO FAMILIAR */}
        <SectionHeader title="4. Entorno Familiar" />
        <View style={tw('flex flex-row flex-wrap mb-4')}>
          <DataRow width="50%" label="Padre" value={user?.padre_nombre} />
          <DataRow width="50%" label="Ocupación" value={user?.padre_ocupacion} />
          <DataRow width="50%" label="Madre" value={user?.madre_nombre} />
          <DataRow width="50%" label="Ocupación" value={user?.madre_ocupacion} />
          <DataRow width="50%" label="Nro. Hermanos" value={user?.familia_num_hermanos} />
          <DataRow width="50%" label="Hermanos Universitarios" value={user?.familia_hermanos_uni} />
        </View>

        {/* 5. BALANCE ECONÓMICO */}
        <SectionHeader title="5. Situación Económica Mensual" />
        <View style={tw('flex flex-row gap-4 mb-4')}>
          <View style={tw('flex-1 bg-emerald-50 p-3 rounded border border-emerald-100')}>
            <Text style={tw('text-[7px] font-black text-emerald-700 mb-1')}>TOTAL INGRESOS</Text>
            <Text style={tw('text-xs font-black text-emerald-900')}>$ {totalIngresos}</Text>
          </View>
          <View style={tw('flex-1 bg-rose-50 p-3 rounded border border-rose-100')}>
            <Text style={tw('text-[7px] font-black text-rose-700 mb-1')}>TOTAL EGRESOS</Text>
            <Text style={tw('text-xs font-black text-rose-900')}>$ {totalEgresos}</Text>
          </View>
        </View>

        {/* 6. VIVIENDA Y SALUD */}
        <SectionHeader title="6. Vivienda, Servicios y Salud" />
        <View style={tw('flex flex-row flex-wrap')}>
          <DataRow width="33%" label="Tipo Vivienda" value={user?.vivienda_tipo} />
          <DataRow width="33%" label="Estatus" value={user?.vivienda_estatus} />
          <DataRow width="33%" label="Salud" value={user?.salud_enfermedad_desc ? 'Condición Médica' : 'Buena'} />
          <DataRow width="100%" label="Servicios" value={`${user?.serv_agua === 'on' ? 'Agua, ' : ''}${user?.serv_luz === 'on' ? 'Luz, ' : ''}${user?.serv_internet === 'on' ? 'Internet' : ''}`} />
          <DataRow width="100%" label="Descripción Salud" value={user?.salud_enfermedad_desc} />
        </View>
      </Page>
    </Document>
  );
};