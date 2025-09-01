// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Typography,
//   useTheme,
//   Card,
//   CardContent,
//   CardHeader,
//   Box,
//   Stack,
//   Button,
// } from "@mui/material";
// import Menu from "../../Menu";
// import { CorridaFrontend, getCorridaById } from "../../../api/corridaService";
// import { OcorrenciaDto,OcorrenciaService } from "../../../api/ocorrenciasService";
// import { GridColDef } from "@mui/x-data-grid";

// const DetalhesRequisicao: React.FC = () => {
//   const theme = useTheme();
//   const { id } = useParams<{ id: string }>();
//   const [corrida, setCorrida] = useState<CorridaFrontend | null>(null);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (id) {
//       getCorridaById(Number(id))
//         .then((res) => setCorrida(res))
//         .catch((err) => console.error("Erro ao carregar corrida:", err))
//         .finally(() => setLoading(false));
//     }
//   }, [id]);

//   const columnsOcorrencias: GridColDef<OcorrenciaDto>[] = [
//       {
//         field: 'descricao',
//         headerName: 'Descrição',
//         flex: 1,
//         renderCell: (params) => (
//           <Typography fontWeight="bold">{params.value}</Typography>
//         )
//       },
//       {
//         field: 'acoes',
//         headerName: 'Ações',
//         flex: 1,
//         sortable: false,
//         filterable: false,
//         renderCell: (params) => {
//           const ocorrencia = params.row;
//           return(
//             <Box sx={{ display: 'flex', gap: 1 }}>
//             <Button
//               variant="outlined"
//               color="warning"
//               size="small"
//               //onClick={() => handleAbrirModalEditarOcorrencia(ocorrencia)}
//             >
//               Editar
//             </Button>
//             </Box>
//           );
//         }
//       }
//   ]


//   return (
//     <>
//       <Menu />
//       {/* Informações Básicas */}
//         <Card
//         sx={{
//           height: "100%",
//           boxShadow: theme.shadows[1],
//           border: "1px solid",
//           borderColor: "divider",
//           background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
//         }}
//       >
//         <CardHeader
//           title="Informações Básicas"
//           sx={{
//             pb: 0,
//             "& .MuiCardHeader-title": {
//               fontSize: "1.25rem",
//               fontWeight: 600,
//             },
//           }}
//         />
//         <CardContent>
//           {loading ? (
//             <Typography variant="body2" color="text.secondary">
//               Carregando informações da corrida...
//             </Typography>
//           ) : corrida ? (
//             <Stack spacing={1.5}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Motorista:
//                 </Typography>
//                 <Typography variant="body1">{corrida.nomeMotorista}</Typography>
//               </Box>

//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Carro:
//                 </Typography>
//                 <Typography variant="body1">{corrida.placaVeiculo}</Typography>
//               </Box>

//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Data do início:
//                 </Typography>
//                 <Typography variant="body1">
//                   {new Date(corrida.dataInicio).toLocaleString()}
//                 </Typography>
//               </Box>

//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Data do término:
//                 </Typography>
//                 <Typography variant="body1">
//                   {corrida.dataTermino
//                     ? new Date(corrida.dataTermino).toLocaleString()
//                     : "Em andamento"}
//                 </Typography>
//               </Box>

//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Status:
//                 </Typography>
//                 <Typography variant="body1">{corrida.situacao}</Typography>
//               </Box>

//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Status da chave:
//                 </Typography>
//                 <Typography variant="body1">
//                   {corrida.chaveEmprestada ? "Emprestada" : "Não Emprestada"}
//                 </Typography>
//               </Box>
//             </Stack>
//           ) : (
//             <Typography variant="body2" color="error">
//               Corrida não encontrada.
//             </Typography>
//           )}
//         </CardContent>
//       </Card>

//       {/* Ocorrências */}
//       <Card
//         sx={{
//           height: "100%",
//           boxShadow: theme.shadows[1],
//           border: "1px solid",
//           borderColor: "divider",
//           background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
//         }}
//       >
//         <CardHeader
//           title="Ocorrências cadastradas na corrida"
//           sx={{
//             pb: 0,
//             "& .MuiCardHeader-title": {
//               fontSize: "1.25rem",
//               fontWeight: 600,
//             },
//           }}
//         />
//         <CardContent>
//           {loading ? (
//             <Typography variant="body2" color="text.secondary">
//               Carregando informações da corrida...
//             </Typography>
//           ) : corrida ? (
//             <Stack spacing={1.5}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary">
//                   Descrição:
//                 </Typography>
//                 <Typography variant="body1">{corrida.nomeMotorista}</Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Data registro:
//                 </Typography>
//                 <Typography variant="body1">{corrida.placaVeiculo}</Typography>
//               </Box>
//             </Stack>
//           ) : (
//             <Typography variant="body2" color="error">
//               Corrida não encontrada.
//             </Typography>
//           )}
//         </CardContent>
//       </Card>

//       {/* Abastecimentos */}
//       <Card
//         sx={{
//           height: "100%",
//           boxShadow: theme.shadows[1],
//           border: "1px solid",
//           borderColor: "divider",
//           background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
//         }}
//       >
//         <CardHeader
//           title="Abastecimentos cadastrados na corrida"
//           sx={{
//             pb: 0,
//             "& .MuiCardHeader-title": {
//               fontSize: "1.25rem",
//               fontWeight: 600,
//             },
//           }}
//         />
//         <CardContent>
//           {loading ? (
//             <Typography variant="body2" color="text.secondary">
//               Carregando informações da corrida...
//             </Typography>
//           ) : corrida ? (
//             <Stack spacing={1.5}>
//               <Box>
//                 {/* aqui vão as informações do abastecimento */}
//               </Box>
//             </Stack>
//           ) : (
//             <Typography variant="body2" color="error">
//               Não existem abastecimentos cadastrados.
//             </Typography>
//           )}
//         </CardContent>
//       </Card>

      
//       {/* Percursos */}
//       <Card
//         sx={{
//           height: "100%",
//           boxShadow: theme.shadows[1],
//           border: "1px solid",
//           borderColor: "divider",
//           background: theme.palette.mode === "dark" ? "#2D333A" : "#fff",
//         }}
//       >
//         <CardHeader
//           title="Percursos cadastrados na corrida"
//           sx={{
//             pb: 0,
//             "& .MuiCardHeader-title": {
//               fontSize: "1.25rem",
//               fontWeight: 600,
//             },
//           }}
//         />
//         <CardContent>
//           {loading ? (
//             <Typography variant="body2" color="text.secondary">
//               Carregando informações da corrida...
//             </Typography>
//           ) : corrida ? (
//             <Stack spacing={1.5}>
//               <Box>
//                 {/* aqui vão as informações dos percursos cadastrados */}
//               </Box>
//             </Stack>
//           ) : (
//             <Typography variant="body2" color="error">
//               Não existem abastecimentos cadastrados.
//             </Typography>
//           )}
//         </CardContent>
//       </Card>
      
//     </>
    
//   );
// };

// export default DetalhesRequisicao;
