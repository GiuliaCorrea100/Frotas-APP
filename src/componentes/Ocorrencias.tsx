import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, TextField, Button, Typography } from "@mui/material";
import { OcorrenciaDto, OcorrenciaService } from '../api/ocorrenciasService';
import Menu from "./Menu";

const columns: GridColDef<OcorrenciaDto>[] = [
  {
    field: 'idOcorrencia',
    headerName: 'ID',
    flex: 1,
    renderCell: (params) => <>{params.value}</>,
  },
  {
    field: 'descricao',
    headerName: 'Descrição',
    flex: 2,
    renderCell: (params) => <>{params.value}</>,
  },
  {
    field: 'idCorrida',
    headerName: 'Corrida',
    flex: 1,
    renderCell: (params) => <>{params.value}</>,
  },
];

export default function ListaOcorrencias() {
  const [busca, setBusca] = useState('');
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [descricao, setDescricao] = useState('');
  const [idCorrida, setIdCorrida] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    carregarOcorrencias();
  }, []);

  const carregarOcorrencias = async () => {
    try {
      const dados = await OcorrenciaService.buscarTodos();
      setOcorrencias(dados);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!descricao || !idCorrida) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    try {
      const novaOcorrencia = {
        descricao,
        idCorrida: Number(idCorrida),
      };

      await OcorrenciaService.criar(novaOcorrencia);
      setMensagem("Ocorrência salva com sucesso!");
      
      setDescricao('');
      setIdCorrida('');

      carregarOcorrencias();
    } catch (error) {
      console.error("Erro ao salvar ocorrência:", error);
      setMensagem("Erro ao salvar ocorrência.");
    }
  };

  const dadosFiltrados = ocorrencias.filter((ocorrencia) =>
    Object.values(ocorrencia).some((valor) =>
      String(valor).toLowerCase().includes(busca.toLowerCase())
    )
  );

  return (
    <>
      <Menu />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Listagem de Ocorrências da Corrida
        </Typography>

        <TextField
          label="Buscar"
          variant="outlined"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ mb: 2, mr: 2 }}
        />

        <Box sx={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={dadosFiltrados}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.idOcorrencias ?? `${row.idCorrida}-${row.descricao}`}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Box>


        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Nova Ocorrência
          </Typography>

          <TextField
            label="Descrição"
            fullWidth
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="ID da Corrida"
            type="number"
            fullWidth
            value={idCorrida}
            onChange={(e) => setIdCorrida(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={handleSalvar}>
            Salvar Ocorrência
          </Button>

          {mensagem && (
            <Typography sx={{ mt: 2, color: mensagem.includes("sucesso") ? "green" : "red" }}>
              {mensagem}
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
}
