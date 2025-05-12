import { Button } from "@mui/material";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import * as React from 'react';
import { Link } from "react-router-dom";

import Menu from "../Menu";

// Definindo interface para os carros
interface Carro {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  status: string;
}

// Dados falsos com tipagem explícita
const carrosFake: Carro[] = [
  { id: 1, placa: 'ABC-1234', modelo: 'Gol', marca: 'Volkswagen', ano: 2020, status: 'Ativo' },
  { id: 2, placa: 'DEF-5678', modelo: 'Fiesta', marca: 'Ford', ano: 2018, status: 'Em manutenção' },
  { id: 3, placa: 'GHI-9012', modelo: 'Civic', marca: 'Honda', ano: 2022, status: 'Ativo' },
  { id: 4, placa: 'JKL-3456', modelo: 'Corolla', marca: 'Toyota', ano: 2019, status: 'Inativo' },
  { id: 5, placa: 'MNO-7890', modelo: 'Uno', marca: 'Fiat', ano: 2017, status: 'Ativo' },
];

// Tipagem das colunas
const columns: GridColDef[] = [
  { field: 'placa', headerName: 'Placa', flex: 1 },
  { field: 'modelo', headerName: 'Modelo', flex: 1 },
  { field: 'marca', headerName: 'Marca', flex: 1 },
  { field: 'ano', headerName: 'Ano', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
];

export default function ListaCarros(): React.JSX.Element {
  const [busca, setBusca] = React.useState<string>('');
  const [dadosFiltrados, setDadosFiltrados] = React.useState<Carro[]>(carrosFake);

  React.useEffect(() => {
    const resultado = carrosFake.filter((carro) =>
      Object.values(carro).some((valor) =>
        String(valor).toLowerCase().includes(busca.toLowerCase())
      )
    );
    setDadosFiltrados(resultado);
  }, [busca]);

  return (
    <>
      <Menu />
      <Box className="lista-container">
        <h1>
          Listagem de Carros
        </h1>
        <Button color='inherit' component={Link} to="/CadastroCarro">
          + Cadastrar Carro
        </Button>
        <TextField
          label="Buscar"
          variant="outlined"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <DataGrid
          rows={dadosFiltrados}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          autoHeight
        />
      </Box>
    </>
  );
}
