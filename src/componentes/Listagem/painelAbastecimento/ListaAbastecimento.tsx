import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
  GridValueGetterParams
} from "@mui/x-data-grid";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AbastecimentoService, { Abastecimento } from "../../../api/abastecimentoService";
import { TipoCombustivel, TipoCombustivelService } from "../../../api/tipoCombustivelService";
import Menu from "../../Menu";

export default function ListaAbastecimentos() {
  const theme = useTheme();

  // Estados principais
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  
  // Estados para filtros e busca
  const [busca, setBusca] = useState("");
  const [filtroCombustivel, setFiltroCombustivel] = useState<string>("TODOS");

  // Estados para o modal de exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [abastecimentoParaDeletar, setAbastecimentoParaDeletar] = useState<Abastecimento | null>(null);

  // Calcula contadores de combustível
  const contadores = useMemo(() => {
    const contadoresIniciais: Record<string, number> = { TODOS: abastecimentos.length };
    
    tiposCombustivel.forEach(tc => {
      if(tc.id_tipo_combustivel) {
        contadoresIniciais[tc.id_tipo_combustivel] = abastecimentos.filter(
          a => a.tipo_combustivel?.id_tipo_combustivel === tc.id_tipo_combustivel
        ).length;
      }
    });
    
    return contadoresIniciais;
  }, [abastecimentos, tiposCombustivel]);

  // Função para carregar todos os dados da API
  const carregarDados = async () => {
    try {
      const [listaAbastecimentos, responseCombustiveis] = await Promise.all([
        AbastecimentoService.BuscarTodosAbastecimentos({ expand: true }),
        TipoCombustivelService.listar()
      ]);
      setAbastecimentos(listaAbastecimentos);
      setTiposCombustivel(responseCombustiveis.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Falha ao carregar dados. Verifique o console para mais detalhes.");
    }
  };

  // Carrega os dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Filtra os abastecimentos
  const filteredAbastecimentos = useMemo(() => {
    const termoBusca = busca.toLowerCase();
    
    return abastecimentos.filter(a => {
      const matchesSearch = 
        a.idAbastecimento?.toString().includes(termoBusca) ||
        a.litros.toString().toLowerCase().includes(termoBusca) ||
        a.precoFinal.toString().toLowerCase().includes(termoBusca) ||
        a.dataAbastecimento.toLowerCase().includes(termoBusca) ||
        (a.tipo_combustivel?.nome?.toLowerCase() || '').includes(termoBusca);

      const idCombustivel = a.tipo_combustivel?.id_tipo_combustivel;
      const matchesFilter = filtroCombustivel === "TODOS" || String(idCombustivel) === filtroCombustivel;

      return matchesSearch && matchesFilter;
    });
  }, [abastecimentos, busca, filtroCombustivel]);

  // Funções para controlar o modal de exclusão
  const handleAbrirModal = (abastecimento: Abastecimento) => {
    setAbastecimentoParaDeletar(abastecimento);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAbastecimentoParaDeletar(null);
  };

  const handleConfirmarDelete = async () => {
    if (!abastecimentoParaDeletar?.idAbastecimento) return;

    try {
      await AbastecimentoService.DeletarAbastecimento(abastecimentoParaDeletar.idAbastecimento);
      alert("Abastecimento deletado com sucesso!");
      handleFecharModal();
      await carregarDados();
    } catch (error) {
      console.error("Erro ao deletar abastecimento:", error);
      alert("Erro ao deletar o abastecimento.");
    }
  };

  // Definição das colunas da tabela
  // ... importações ...

const columns: GridColDef<Abastecimento>[] = [
  { 
    field: 'idAbastecimento', 
    headerName: 'ID', 
    width: 80, 
    renderCell: params => <Typography fontWeight="bold">{params.value}</Typography>
  },
  {
    field: 'combustivel',
    headerName: 'Combustível',
    flex: 1,
    // Corrigido: usando valueGetter com tipagem adequada
    valueGetter: (params: GridValueGetterParams<Abastecimento>) => 
      params.row.tipo_combustivel?.nome || 'N/A'
  },
  { 
    field: 'litros', 
    headerName: 'Litros', 
    flex: 1, 
    type: 'number' 
  },
  { 
    field: 'precoFinal', 
    headerName: 'Preço Final', 
    flex: 1, 
    type: 'number', 
    // Corrigido: usando valueFormatter com tipagem adequada
    valueFormatter: (params: GridValueFormatterParams<number>) => 
      params.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  },
  { 
    field: 'dataAbastecimento', 
    headerName: 'Data', 
    flex: 1,
    // Corrigido: usando valueFormatter com tipagem adequada
    valueFormatter: (params: GridValueFormatterParams<string>) => 
      new Date(params.value).toLocaleDateString()
  },
  { 
    field: 'idCorrida', 
    headerName: 'ID Corrida', 
    flex: 1, 
    // Corrigido: usando valueGetter com tipagem adequada
    valueGetter: (params: GridValueGetterParams<Abastecimento>) => 
      params.row.corrida?.idCorrida || 'N/A' 
  },
  {
    field: 'acoes',
    headerName: 'Ações',
    flex: 1,
    headerAlign: 'center',
    align: 'center',
    sortable: false,
    // Corrigido: usando renderCell com tipagem adequada
    renderCell: (params: GridRenderCellParams<Abastecimento>) => (
      <Box display="flex" gap={1}>
        <Tooltip title="Editar Abastecimento">
          <IconButton
            color="primary"
            size="small"
            component={Link}
            to={`/EditarAbastecimento/${params.id}`}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deletar Abastecimento">
          <IconButton
            color="error"
            size="small"
            onClick={() => handleAbrirModal(params.row)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
];

  return (
    <>
      <Menu />
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">
            Listagem de Abastecimentos
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/CadastroAbastecimento"
            startIcon={<Add />}
            sx={{ textTransform: "none", fontWeight: 600, boxShadow: theme.shadows[2] }}
          >
            Novo Abastecimento
          </Button>
        </Box>

        {/* Filtros por Botão com Contadores */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              onClick={() => setFiltroCombustivel("TODOS")}
              variant={filtroCombustivel === "TODOS" ? "contained" : "outlined"}
            >
              Todos
              <Box component="span" sx={{ ml: 1, px: 1, borderRadius: 12, fontWeight: 600 }}>
                {contadores.TODOS}
              </Box>
            </Button>
            
            {tiposCombustivel.map(tc => (
              <Button
                key={tc.id_tipo_combustivel}
                onClick={() => setFiltroCombustivel(tc.id_tipo_combustivel!.toString())}
                variant={filtroCombustivel === tc.id_tipo_combustivel?.toString() ? "contained" : "outlined"}
              >
                {tc.nome}
                <Box component="span" sx={{ ml: 1, px: 1, borderRadius: 12, fontWeight: 600 }}>
                  {contadores[tc.id_tipo_combustivel!] || 0}
                </Box>
              </Button>
            ))}
          </Box>
          
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>
        
        {/* Tabela */}
        <Box sx={{ height: 500, width: '100%', boxShadow: theme.shadows[1], borderRadius: 2 }}>
          <DataGrid
            rows={filteredAbastecimentos}
            columns={columns}
            getRowId={row => row.idAbastecimento!}
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </Box>
      </Box>

      {/* Modal de Confirmação para Deletar */}
      <Modal open={modalAberto} onClose={handleFecharModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" mb={2}>
            Confirmar Exclusão
          </Typography>
          <Typography>
            Tem certeza de que deseja deletar o abastecimento ID: 
            <strong> {abastecimentoParaDeletar?.idAbastecimento}</strong>?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button onClick={handleFecharModal} variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleConfirmarDelete} variant="contained" color="error">
              Deletar
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}