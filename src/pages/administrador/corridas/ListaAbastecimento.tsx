// import { Add, Delete, Edit } from "@mui/icons-material";
// import {
//   Box,
//   Button,
//   IconButton,
//   Modal,
//   TextField,
//   Tooltip,
//   Typography,
//   useTheme,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   FormHelperText,
// } from "@mui/material";
// import {
//   GridColDef,
//   DataGrid,
// } from "@mui/x-data-grid";
// import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import AbastecimentoService, { Abastecimento } from "../../../api/abastecimentoService";
// import { TipoCombustivel, TipoCombustivelService } from "../../../api/tipoCombustivelService";
// import Menu from "../../Menu";

// export default function ListaAbastecimentos() {
//   const theme = useTheme();

//   // Estados principais
//   const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
//   const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivel[]>([]);
  
//   // Estados para filtros e busca
//   const [busca, setBusca] = useState("");
//   const [filtroCombustivel, setFiltroCombustivel] = useState<string>("TODOS");

//   // Estados para os modais
//   const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
//   const [modalEditarAberto, setModalEditarAberto] = useState(false);
//   const [abastecimentoSelecionado, setAbastecimentoSelecionado] = useState<Abastecimento | null>(null);
//   const [justificativa, setJustificativa] = useState("");
//   const [erros, setErros] = useState({
//     justificativa: false,
//     tipoCombustivel: false,
//   });

//   // Calcula contadores de combustível
//   const contadores = useMemo(() => {
//     const contadoresIniciais: Record<string, number> = { TODOS: abastecimentos.length };
    
//     tiposCombustivel.forEach(tc => {
//       if(tc.tivel) {
//         contadoresIniciais[tc.tivel] = abastecimentos.filter(
//           a => a.tipoCombustivel?.tivel === tc.tivel
//         ).length;
//       }
//     });
    
//     return contadoresIniciais;
//   }, [abastecimentos, tiposCombustivel]);

//   // Função para carregar todos os dados da API
//   const carregarDados = async () => {
//     try {
//       const [listaAbastecimentos, responseCombustiveis] = await Promise.all([
//         AbastecimentoService.BuscarTodosAbastecimentos({ expand: true }),
//         TipoCombustivelService.listar()
//       ]);
//       setAbastecimentos(listaAbastecimentos);
//       setTiposCombustivel(responseCombustiveis.data);
//     } catch (error) {
//       console.error("Erro ao carregar dados:", error);
//       alert("Falha ao carregar dados. Verifique o console para mais detalhes.");
//     }
//   };

//   // Carrega os dados iniciais
//   useEffect(() => {
//     carregarDados();
//   }, []);

//   // Filtra os abastecimentos
//   const filteredAbastecimentos = useMemo(() => {
//     const termoBusca = busca.toLowerCase();
    
//     return abastecimentos.filter(a => {
//       const matchesSearch = 
//         a.idAbastecimento?.toString().includes(termoBusca) ||
//         a.litros.toString().toLowerCase().includes(termoBusca) ||
//         a.precoFinal.toString().toLowerCase().includes(termoBusca) ||
//         a.dataAbastecimento.toLowerCase().includes(termoBusca) ||
//         (a.tipoCombustivel?.nome?.toLowerCase() || '').includes(termoBusca);

//       const idCombustivel = a.tipoCombustivel?.tivel;
//       const matchesFilter = filtroCombustivel === "TODOS" || String(idCombustivel) === filtroCombustivel;

//       return matchesSearch && matchesFilter;
//     });
//   }, [abastecimentos, busca, filtroCombustivel]);

//   // Funções para controlar o modal de deletar
//   const handleAbrirModalDeletar = (abastecimento: Abastecimento) => {
//     setAbastecimentoSelecionado(abastecimento);
//     setModalDeletarAberto(true);
//   };

//   const handleFecharModalDeletar = () => {
//     setModalDeletarAberto(false);
//     setAbastecimentoSelecionado(null);
//   };

//   const handleConfirmarDelete = async () => {
//     if (!abastecimentoSelecionado?.idAbastecimento) return;

//     try {
//       await AbastecimentoService.DeletarAbastecimento(abastecimentoSelecionado.idAbastecimento);
//       alert("Abastecimento deletado com sucesso!");
//       handleFecharModalDeletar();
//       await carregarDados();
//     } catch (error) {
//       console.error("Erro ao deletar abastecimento:", error);
//       alert("Erro ao deletar o abastecimento.");
//     }
//   };

//   // Funções para controlar o modal de editar
//   const handleAbrirModalEditar = (abastecimento: Abastecimento) => {
//     setAbastecimentoSelecionado(abastecimento);
//     setJustificativa("");
//     setErros({ justificativa: false, tipoCombustivel: false });
//     setModalEditarAberto(true);
//   };

//   const handleFecharModalEditar = () => {
//     setModalEditarAberto(false);
//     setAbastecimentoSelecionado(null);
//     setJustificativa("");
//   };

//   const handleEditarAbastecimento = async () => {
//     if (!abastecimentoSelecionado) return;

//     // Validação
//     const novosErros = {
//       justificativa: !justificativa,
//       tipoCombustivel: !abastecimentoSelecionado.tipoCombustivel?.tivel,
//     };

//     setErros(novosErros);

//     if (novosErros.justificativa || novosErros.tipoCombustivel) {
//       return;
//     }

//     try {
//       const dadosAtualizacao = {
//         ...abastecimentoSelecionado,
//         justificativaAlteracao: justificativa,
//         tipoCombustivel: abastecimentoSelecionado.tipoCombustivel
//       };

//       await AbastecimentoService.AtualizarAbastecimento(
//         abastecimentoSelecionado.idAbastecimento!,
//         dadosAtualizacao
//       );

//       alert("Abastecimento atualizado com sucesso!");
//       handleFecharModalEditar();
//       await carregarDados();
//     } catch (error) {
//       console.error("Erro ao atualizar abastecimento:", error);
//       alert("Erro ao atualizar o abastecimento.");
//     }
//   };

//   const handleChangeTipoCombustivel = (id: number) => {
//     if (!abastecimentoSelecionado) return;

//     const tipoSelecionado = tiposCombustivel.find(tc => tc.tivel === id);
    
//     if (tipoSelecionado) {
//       setAbastecimentoSelecionado({
//         ...abastecimentoSelecionado,
//         tipoCombustivel: tipoSelecionado
//       });
//     }

//     setErros({ ...erros, tipoCombustivel: false });
//   };

//   const columns: GridColDef<Abastecimento>[] = [
//     { 
//       field: 'idAbastecimento', 
//       headerName: 'ID', 
//       width: 80, 
//       renderCell: (params) => <Typography>{params.value}</Typography>
//     },
//      {
//     field: 'tivel',
//     headerName: 'Combustível',
//     flex: 1,
//     renderCell: (params) => {
//     const tipo = tiposCombustivel.find(tc => tc.tivel === params.value);
//     return <Typography>{tipo ? tipo.nome : 'N/A'}</Typography>;
//     }
//   },
//     { 
//       field: 'litros', 
//       headerName: 'Litros', 
//       flex: 1,
//       renderCell: (params) => (
//         <Typography>{params.value?.toLocaleString('pt-BR') || '0'}</Typography>
//       )
//     },

//     {
//       field: 'precoFinal',
//       headerName: 'Preço Final',
//       flex: 1,
//       renderCell: (params) => {
//         const value = parseFloat(params.value);
//         const formatted = isNaN(value) 
//           ? 'N/A' 
//           : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//         return <Typography>{formatted}</Typography>;
//       }
//     },
//     {
//       field: 'valorUnitarioLitro',
//       headerName: 'Valor Unitário por Litro',
//       flex: 1,
//       renderCell: (params) => {
//         const value = parseFloat(params.value);
//         const formatted = isNaN(value) 
//           ? 'N/A' 
//           : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//         return <Typography>{formatted}</Typography>;
//       }
//     }, 

//     {
//       field: 'valorMedioLitro',
//       headerName: 'Valor Médio por Litro',
//       flex: 1,
//       renderCell: (params) => {
//         const value = parseFloat(params.value);
//         const formatted = isNaN(value) 
//           ? 'N/A' 
//           : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//         return <Typography>{formatted}</Typography>;
//       }
//     }, 
// {
//       field: 'valorUnitario',
//       headerName: 'Valor Unitário',
//       flex: 1,
//       renderCell: (params) => {
//         const value = parseFloat(params.value);
//         const formatted = isNaN(value) 
//           ? 'N/A' 
//           : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//         return <Typography>{formatted}</Typography>;
//       }
//     }, 

//     {
//       field: 'valorMedioLitro',
//       headerName: 'Valor Médio',
//       flex: 1,
//       renderCell: (params) => {
//         const value = parseFloat(params.value);
//         const formatted = isNaN(value) 
//           ? 'N/A' 
//           : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
//         return <Typography>{formatted}</Typography>;
//       }
//     }, 
//     { 
//       field: 'dataAbastecimento', 
//       headerName: 'Data', 
//       flex: 1,
//       renderCell: (params) => {
//         let dateText = 'N/A';
//         if (params.value) {
//           try {
//             dateText = new Date(params.value).toLocaleDateString('pt-BR');
//           } catch {
//             dateText = 'Data inválida';
//           }
//         }
//         return <Typography>{dateText}</Typography>;
//       }
//     },
//     {
//     field: 'id_corrida',
//     headerName: 'Corrida',
//     flex: 1,
//     renderCell: (params) => {
//       return (
//         <Typography>
//           {params.value || 'N/A'}
//         </Typography>
//       );
//     }
//   },
//   {
//       field: 'justificativaAlteracao',
//       headerName: 'Justificativa de Alteração',
//       flex: 1,
//       renderCell: (params) => {
//         return (
//           <Typography>
//             {params.value || 'N/A'}
//           </Typography>
//         );
//       }
//     }, 
//     {
//       field: 'acoes',
//       headerName: 'Ações',
//       flex: 1,
//       headerAlign: 'center',
//       align: 'center',
//       sortable: false,
//       renderCell: (params) => (
//         <Box display="flex" gap={1}>
//           <Tooltip title="Editar Abastecimento">
//             <IconButton
//               color="primary"
//               size="small"
//               onClick={() => handleAbrirModalEditar(params.row)}
//             >
//               <Edit fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Deletar Abastecimento">
//             <IconButton
//               color="error"
//               size="small"
//               onClick={() => handleAbrirModalDeletar(params.row)}
//             >
//               <Delete fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       )
//     }
//   ];

//   return (
//     <>
//       <Menu />
//       <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
        
//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//           <Typography variant="h5" fontWeight="bold" color="textPrimary">
//             Listagem de Abastecimentos
//           </Typography>
//           <Button
//             variant="contained"
//             component={Link}
//             to="/CadastroAbastecimento"
//             startIcon={<Add />}
//             sx={{ textTransform: "none", fontWeight: 600, boxShadow: theme.shadows[2] }}
//           >
//             Novo Abastecimento
//           </Button>
//         </Box>

//         {/* Filtros por Botão com Contadores */}
//         <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
//           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//             <Button
//               onClick={() => setFiltroCombustivel("TODOS")}
//               variant={filtroCombustivel === "TODOS" ? "contained" : "outlined"}
//             >
//               Todos
//               <Box component="span" sx={{ ml: 1, px: 1, borderRadius: 12, fontWeight: 600 }}>
//                 {contadores.TODOS}
//               </Box>
//             </Button>
            
//             {tiposCombustivel.map(tc => (
//               <Button
//                 key={tc.tivel}
//                 onClick={() => setFiltroCombustivel(tc.tivel!.toString())}
//                 variant={filtroCombustivel === tc.tivel?.toString() ? "contained" : "outlined"}
//               >
//                 {tc.nome}
//                 <Box component="span" sx={{ ml: 1, px: 1, borderRadius: 12, fontWeight: 600 }}>
//                   {contadores[tc.tivel!] || 0}
//                 </Box>
//               </Button>
//             ))}
//           </Box>
          
//           <TextField
//             placeholder="Buscar..."
//             variant="outlined"
//             size="small"
//             value={busca}
//             onChange={e => setBusca(e.target.value)}
//             sx={{ width: 250 }}
//           />
//         </Box>
        
//         {/* Tabela */}
//         <Box sx={{ height: 500, width: '100%', boxShadow: theme.shadows[1], borderRadius: 2 }}>
//           <DataGrid
//             rows={filteredAbastecimentos}
//             columns={columns}
//             getRowId={row => row.idAbastecimento!}
//             pageSizeOptions={[10, 20, 50]}
//             initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
//           />
//         </Box>
//       </Box>

//       {/* Modal de Confirmação para Deletar */}
//       <Modal open={modalDeletarAberto} onClose={handleFecharModalDeletar}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 400,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//           }}
//         >
//           <Typography variant="h6" component="h2" mb={2}>
//             Confirmar Exclusão
//           </Typography>
//           <Typography>
//             Tem certeza de que deseja deletar o abastecimento ID: 
//             <strong> {abastecimentoSelecionado?.idAbastecimento}</strong>?
//           </Typography>
//           <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
//             <Button onClick={handleFecharModalDeletar} variant="outlined">
//               Cancelar
//             </Button>
//             <Button onClick={handleConfirmarDelete} variant="contained" color="error">
//               Deletar
//             </Button>
//           </Box>
//         </Box>
//       </Modal>

//       {/* Modal para Editar Tipo de Combustível */}
//       <Modal open={modalEditarAberto} onClose={handleFecharModalEditar}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             width: 400,
//             bgcolor: 'background.paper',
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//           }}
//         >
//           <Typography variant="h6" component="h2" mb={2}>
//             Editar Abastecimento ID: {abastecimentoSelecionado?.idAbastecimento}
//           </Typography>

//           <FormControl fullWidth margin="normal" error={erros.tipoCombustivel}>
//             <InputLabel id="tipo-combustivel-label">Tipo de Combustível</InputLabel>
//             <Select
//               labelId="tipo-combustivel-label"
//               value={abastecimentoSelecionado?.tipoCombustivel?.tivel || ''}
//               label="Tipo de Combustível"
//               onChange={(e) => handleChangeTipoCombustivel(Number(e.target.value))}
//             >
//               {tiposCombustivel.map((tipo) => (
//                 <MenuItem key={tipo.tivel} value={tipo.tivel}>
//                   {tipo.nome}
//                 </MenuItem>
//               ))}
//             </Select>
//             {erros.tipoCombustivel && (
//               <FormHelperText>Selecione um tipo de combustível</FormHelperText>
//             )}
//           </FormControl>

//           <TextField
//             label="Justificativa da Alteração"
//             multiline
//             rows={4}
//             fullWidth
//             margin="normal"
//             value={justificativa}
//             onChange={(e) => {
//               setJustificativa(e.target.value);
//               setErros({ ...erros, justificativa: false });
//             }}
//             error={erros.justificativa}
//             helperText={erros.justificativa ? "Campo obrigatório" : ""}
//           />

//           <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
//             <Button onClick={handleFecharModalEditar} variant="outlined">
//               Cancelar
//             </Button>
//             <Button 
//               onClick={handleEditarAbastecimento} 
//               variant="contained" 
//               color="primary"
//             >
//               Salvar Alterações
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//     </>
//   );
// }