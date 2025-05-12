// ListaMulta.tsx
import { Button } from "@mui/material";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import * as React from 'react';
import { Link } from "react-router-dom";

import Menu from '../Menu';

interface Multa {
  id: number;
  numero: string;
  placa: string;
  data: string;
  valor: string;
  motivo: string;
  situacao: string;
}

const multasFake: Multa[] = [
  {
    id: 1,
    numero: 'M-2025001',
    placa: 'ABC-1234',
    data: '2025-03-10',
    valor: 'R$ 150,00',
    motivo: 'Excesso de velocidade (75km/h em via de 50km/h)',
    situacao: 'Em aberto',
  },
  {
    id: 2,
    numero: 'M-2025002',
    placa: 'XYZ-9876',
    data: '2025-02-22',
    valor: 'R$ 200,00',
    motivo: 'Avanço de sinal vermelho',
    situacao: 'Paga',
  },
  {
    id: 3,
    numero: 'M-2025003',
    placa: 'QWE-4567',
    data: '2025-01-15',
    valor: 'R$ 95,23',
    motivo: 'Estacionamento em local proibido',
    situacao: 'Em aberto',
  },
  {
    id: 4,
    numero: 'M-2025004',
    placa: 'KLM-8888',
    data: '2024-12-30',
    valor: 'R$ 180,00',
    motivo: 'Dirigir usando celular',
    situacao: 'Paga',
  },
  {
    id: 5,
    numero: 'M-2025005',
    placa: 'UIO-1597',
    data: '2025-03-01',
    valor: 'R$ 250,00',
    motivo: 'Transitar na contramão',
    situacao: 'Em aberto',
  },
  {
    id: 6,
    numero: 'M-2025006',
    placa: 'GHJ-3344',
    data: '2025-02-10',
    valor: 'R$ 130,50',
    motivo: 'Veículo sem licenciamento',
    situacao: 'Paga',
  },
  {
    id: 7,
    numero: 'M-2025007',
    placa: 'JKL-7766',
    data: '2025-03-25',
    valor: 'R$ 160,75',
    motivo: 'Farol desligado à noite',
    situacao: 'Em aberto',
  },
];

const columns: GridColDef[] = [
  { field: 'numero', headerName: 'Nº da Multa', flex: 1 },
  { field: 'placa', headerName: 'Placa', flex: 1 },
  { field: 'data', headerName: 'Data', flex: 1 },
  { field: 'valor', headerName: 'Valor', flex: 1 },
  { field: 'motivo', headerName: 'Motivo', flex: 2 },
  { field: 'situacao', headerName: 'Situação', flex: 1 },
];

export default function ListaMulta(): React.JSX.Element {
  const [busca, setBusca] = React.useState<string>("");

  const dadosFiltrados = multasFake.filter((multa) =>
    Object.values(multa).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase())
    )
  );

  return (
    <>
      <Menu />
      <Box className="lista-container">
        <h1>
          Listagem de Multa
        </h1>
        <Button color='inherit' component={Link} to="/CadastroMulta">
          + Cadastrar Multa
        </Button>
        <TextField
          label="Buscar multa"
          variant="outlined"
          size="small"
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ mb: 2 }}
        />
        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </Box>
    </>
  );
}
