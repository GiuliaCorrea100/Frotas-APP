// import { Modal, Box, Typography, Button, useTheme, MenuItem, FormControl, Grid,FormHelperText, IconButton, TextField, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
// import { PostAdd as PostAddIcon, Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
// import { useAuth } from '../../../context/AuthContext';
// import axiosConnect from '../../../services/axiosConnect';
// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { BemSituacaoEnum } from '../../../utils/enums/bemSituacaoEnum';

// interface FormularioLaudoProps {
//   idLaudo?: number | null;
//   unidadeSelecionada?: any;
//   open: boolean;
//   onClose: () => void;
//   onSuccess: (message: string) => void;
//   onError: (error: any) => void;
// }

// const FormularioLaudo: React.FC<FormularioLaudoProps> = ({
//   idLaudo,
//   unidadeSelecionada,
//   open,
//   onClose,
//   onSuccess,
//   onError
// }) => {
//     const { token, userName, isAuthenticated } = useAuth();
//     const theme = useTheme();
//     const [laudo, setLaudo] = useState<any>(null);
//     const [tombo, setTombo] = useState<string>('');
//     const [idBem, setIdBem] = useState<number | null>(null);
//     const [descricaoPatrimonial, setDescricaoPatrimonial] = useState('');
//     const [idUnidadeBem, setIdUnidadeBem] = useState<number | null>(null);
//     const [nomeUnidadeBem, setNomeUnidadeBem] = useState('');
//     const [problema, setProblema] = useState('');
//     const [justificativa, setJustificativa] = useState('');
//     const [observacao, setObservacao] = useState('');
//     const [situacao, setSituacao] = useState<BemSituacaoEnum | null>(null);
//     const [modoEdicao, setModoEdicao] = useState(false);
//     const [titulo, setTitulo] = useState<string | null>(null);
//     const [numeroRequisicao, setNumeroRequisicao] = useState<number | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [errorTombo, setErrorTombo] = useState<string | null>(null);
//     const [errorForm, setErrorForm] = useState({
//       tombo: false,
//       situacao: false,
//       problema: false,
//       justificativa: false,
//       observacao: false
//     });
//     const navigate = useNavigate();

//     // Controla/reseta quando um novo laudo é aberto
//     const hasInitializedNewLaudo = React.useRef(false);

//     const fetchDetalhesBem = useCallback(async (tombo: string) => {
//         setErrorTombo(null);
//         setErrorForm(prev => ({ ...prev, tombo: false }));

//          if (tombo.trim() === '') {
//           setErrorForm(prev => ({ ...prev, tombo: true }));
//           setErrorTombo('O campo Tombo não pode estar vazio.');
//           return;
//         }

//         try {
//             const responseEquipamento = await axiosConnect.get(`bemsingu/${tombo}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });

//             const equipamento = responseEquipamento.data;
//             setIdBem(equipamento.idBem);
//             setDescricaoPatrimonial(equipamento.descricaoPatrimonial);
//             setIdUnidadeBem(equipamento.idUnidade);
//             setNomeUnidadeBem(equipamento.nomeUnidade);

//             try {
//                   const responseRequisicao = await axiosConnect.get(`/requisicao/ativa-por-tombo/${tombo}`, {
//                     headers: { Authorization: `Bearer ${token}` }
//                   });
        
//                 const requisicao = responseRequisicao.data;
//                 setNumeroRequisicao(requisicao.idRequisicao);
//                 setTitulo(requisicao.titulo);

//               } catch (errorRequisicao) {
//                 if (errorRequisicao.response?.status === 404) {
//                   setNumeroRequisicao(null);
//                   setTitulo('Não há requisição cadastrada');
//                 } else {
//                   console.error('Erro inesperado ao consultar requisição:', errorRequisicao);
//               }
//               }
//             } catch (error) {
//               // Erros na consulta do bem
//               console.error('Erro ao consultar bem ou erro geral:', error);
//               if (error.response?.status === 404) {
//                 setErrorTombo('Tombo não encontrado. Verifique o número do tombo.');
//               } else {
//                 console.error('Erro ao consultar bem. Verifique sua conexão ou tente novamente.');
//               }
//               setIdBem(null);
//               setDescricaoPatrimonial('');
//               setIdUnidadeBem(null);
//               setNomeUnidadeBem('');
//               setNumeroRequisicao(null);
//               setTitulo(null);
//             }

//     }, [token]);

//     const handleConsultaBem = useCallback(async () => {
//       setLoading(true);
//       setErrorTombo('');
//       setErrorForm(prev => ({ ...prev, tombo: false }));

//       if (tombo.trim() === '') {
//         setErrorForm(prev => ({ ...prev, tombo: true }));
//         setErrorTombo('O campo Tombo não pode estar vazio.');
//         setLoading(false);
//         return;
//       }

//       if (modoEdicao) {
//         await fetchDetalhesBem(tombo);
//         setLoading(false);
//         return;
//       }

//       try {
//         const responseLaudo = await axiosConnect.get(`/laudo/consulta/tombo`, {
//           params: { tombo },
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (responseLaudo.data) {
//           setErrorTombo('Este tombo já possui um laudo emitido. Não é possível cadastrar um novo laudo para o mesmo tombo.');
//           setTombo(''); 
//           setLoading(false);
//           return;
//         }
//       } catch (errorLaudo: any) {
//         if (errorLaudo.response?.status !== 404) {
//           console.error('Erro inesperado ao consultar laudo:', errorLaudo);
//           setErrorTombo('Erro ao verificar laudo existente. Tente novamente.');
//           setLoading(false);
//           return;
//         }
//       }

//       await fetchDetalhesBem(tombo);
//       setLoading(false);

//   }, [tombo, modoEdicao, token, fetchDetalhesBem]);

//     useEffect(() => {
//       if (!isAuthenticated) {
//         navigate('/');
//         return;
//       }

//       if (idLaudo) {
//         setModoEdicao(true);
//         setLoading(true);
//         hasInitializedNewLaudo.current = false;
//         const fetchDadosLaudo = async () => {
//           try {
//             const response = await axiosConnect.get(`/laudo/${idLaudo}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//             const laudoData = response.data;

//             setLaudo(laudoData);
//             const fetchedTombo = laudoData.tombo != null ? String(laudoData.tombo) : '';
//             setTombo(fetchedTombo);
//             setProblema(laudoData.problema);
//             setJustificativa(laudoData.justificativa);
//             setObservacao(laudoData.observacao);
//             setSituacao(laudoData.situacao);

//             if (fetchedTombo) {
//                 await fetchDetalhesBem(fetchedTombo);
//             } else {
//                 setErrorTombo('Tombo não encontrado no laudo para edição.');
//                 setIdBem(null);
//             }

//           } catch (err: any) {
//             console.error('Erro ao buscar os dados do laudo:', err);
//             onError('Erro ao carregar dados do laudo. Tente novamente.');
//             onClose();
//           } finally {
//             setLoading(false);
//           }
//         };

//         fetchDadosLaudo();
//       }
//     }, [open, idLaudo, isAuthenticated, navigate, token, onError, onClose, fetchDetalhesBem]);

//    const validateForm = () => {
//     const currentTombo = tombo || '';
//     const isNumeric = /^\d+$/.test(currentTombo);

//     const newError = {
//       tombo: currentTombo.trim() === '' || !isNumeric,
//       situacao: situacao === null,
//       problema: problema.length < 5,
//       justificativa: justificativa.length < 10,
//       observacao: observacao.length < 10
//     };

//     setErrorForm(newError);


//     const isIdBemValid = idBem !== null && !errorTombo; 

//     return !Object.values(newError).some(error => error) && !errorTombo && isIdBemValid;
//   };

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     if (!modoEdicao && idBem === null) {
//         setErrorTombo('Consulte o tombo antes de cadastrar o laudo.');
//         setErrorForm(prev => ({ ...prev, tombo: true }));
//         console.log("Erro: Tombo não consultado em modo de cadastro.");
//         return;
//     }

//     const dadosLaudo = {
//       tombo: Number(tombo),
//       problema,
//       justificativa,
//       observacao,
//       situacao,
//       // idBem: idBem,
//       ...(numeroRequisicao != null && { idRequisicao: numeroRequisicao }) // Inclui idRequisicao apenas se numeroRequisicao for diferente de null
//     };

//     try {
//       let response;
//       if (modoEdicao) {
//         response = await axiosConnect.patch(`/laudo/${idLaudo}/editar`, dadosLaudo, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//       } else {
//         response = await axiosConnect.post('/laudo', dadosLaudo, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//       }

//       const laudoId = response.data.idLaudo;
//       onSuccess(`Laudo nº ${laudoId} ${modoEdicao ? 'editado' : 'cadastrado'} com sucesso!`);
//       onClose();
//       console.log("Laudo salvo com sucesso!");

//     } catch (error: any) {
//       console.error('Erro ao salvar o laudo:', error);
//       if (error.response?.status === 409) {
//         setErrorTombo('Já existe um laudo ativo para este equipamento.');
//         setErrorForm(prev => ({ ...prev, tombo: true }));
//         console.log("Erro 409: Laudo ativo já existe.");
//       } else {
//         onError(`Erro ao salvar laudo: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
//         console.log("Erro desconhecido na API:", error);
//       }
//     }
//   };

//   const isTomboNumericInvalid = (tombo || '').trim() !== '' && !/^\d+$/.test(tombo || '');

//   return (
//     <Modal
//         open={open}
//         onClose={onClose}
//         aria-labelledby="modal-laudo-title"
//         aria-describedby="modal-laudo-description"
//         sx={{
//           overflowY: 'auto',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//     >
//         <Box
//             sx={{
//                 width: '90%',
//                 maxWidth: 900,
//                 maxHeight: '95vh',
//                 overflowY: 'auto',
//                 bgcolor: 'background.paper',
//                 boxShadow: 24,
//                 padding: 0,
//                 borderRadius: 2,
//             }}
//             >
//             {/* Cabeçalho */}
//             <Box
//                 sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 mb: 0,
//                 pb: 1,
//                 borderBottom: `1px solid ${theme.palette.divider}`,
//                 }}
//             >
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                     <PostAddIcon fontSize="large" />
//                     <Typography variant="h6" component="h2" sx={{paddingBottom: 0}}>
//                         {modoEdicao ? "Edição de Laudo" : "Cadastro de Laudo"}
//                     </Typography>
//                 </Box>
//                 <IconButton onClick={onClose}>
//                     <CloseIcon />
//                 </IconButton>
//             </Box>
//             {/* Corpo do formulário */}
//             <Box component="form" onSubmit={handleSubmit} noValidate>
//               <Grid container spacing={3} >
//                 <Grid item xs={10}>
//                     <TextField
//                     label="Tombo"
//                     fullWidth
//                     value={tombo}
//                     onChange={(e) => {
//                         setTombo(e.target.value);
//                         setErrorForm(prev => ({ ...prev, tombo: false }));
//                         setErrorTombo(null);
//                         setIdBem(null);
//                         setDescricaoPatrimonial('');
//                         setIdUnidadeBem(null);
//                         setNomeUnidadeBem('');
//                         setNumeroRequisicao(null);
//                         setTitulo(null);
//                     }}
//                     error={!!errorTombo || isTomboNumericInvalid || (errorForm.tombo && (tombo || '').trim() === '')}
//                     helperText={
//                           (isTomboNumericInvalid)
//                             ? "O tombo deve conter apenas números."
//                             : (errorForm.tombo && (tombo || '').trim() === '')
//                               ? "O campo tombo é obrigatório."
//                               : errorTombo
//                                 ? errorTombo
//                                 : " "
//                         }
//                         sx={{
//                           '& .MuiInputLabel-root': {
//                             color: theme.palette.text.secondary,
//                             '&.Mui-focused': {
//                               color: theme.palette.text.secondary,
//                             },
//                             '&.Mui-error': {
//                               color: theme.palette.error.main,
//                             },
//                           },
//                           '& .MuiOutlinedInput-root': {
//                             '& fieldset': {
//                               borderColor: theme.palette.divider,
//                             },
//                             '&:hover fieldset': {
//                               borderColor: theme.palette.text.secondary,
//                             },
//                             '&.Mui-focused fieldset': {
//                               borderColor: theme.palette.text.secondary,
//                             },
//                           },
//                         }}
//                       />
//                 </Grid>

//                 {/* Botão de consulta de bem*/}
//                 <Grid item xs={2} sx={{ paddingTop: '20px' }}>
//                     <Button
//                     variant="contained"
//                     onClick={handleConsultaBem}
//                     sx={{ minWidth: '100%', height: '56px' }}
//                     disabled={ (tombo || '').trim() === '' || isTomboNumericInvalid}
//                     >
//                         <SearchIcon />
//                     </Button>
//                 </Grid>

//                 {descricaoPatrimonial && (
//                   <>
//                     <Grid item xs={12}>
//                       <Grid container spacing={2}>
//                         {/* Card com informações do equipamento */}
//                         <Grid item xs={6}>
//                           <Box sx={{
//                             height: '100%',
//                             background: theme.palette.mode === 'dark' ? '#2D333A' : '#ffffff',
//                             boxShadow: 'none',
//                             border: `1px solid ${theme.palette.divider}`,
//                             borderRadius: 2,
//                             p: 2,
//                           }}>
//                               <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 'bold'}}>INFORMAÇÕES DO EQUIPAMENTO</Typography>
//                               <Typography><strong>Descrição patrimonial:</strong> {descricaoPatrimonial}</Typography>
//                               <Typography sx={{ mt: 1 }}><strong>Unidade:</strong>  {nomeUnidadeBem}</Typography>
//                           </Box>
//                         </Grid>
//                         {/* Card com informações da requisição */}
//                         <Grid item xs={6}>
//                           <Box sx={{
//                             height: '100%',
//                             background: theme.palette.mode === 'dark' ? '#2D333A' : '#ffffff',
//                             boxShadow: 'none',
//                             border: `1px solid ${theme.palette.divider}`,
//                             borderRadius: 2,
//                             p: 2,
//                           }}>
//                               <Typography variant='subtitle1' gutterBottom sx={{ fontWeight: 'bold'}}>INFORMAÇÕES DA REQUISIÇÃO</Typography>
//                                 {numeroRequisicao ? (
//                                   <>
//                                     <Typography><strong>Número da Requisição:</strong> {numeroRequisicao}</Typography>
//                                     <Typography sx={{ mt: 1 }}><strong>Título:</strong> {titulo}</Typography>
//                                   </>
//                                 ) : (
//                                   <Typography>{titulo}</Typography>
//                                 )}
//                           </Box>
//                         </Grid>
//                       </Grid>
//                     </Grid>
//                   </>
//                 )}

//                 <Grid item xs={12}>
//                   <FormControl
//                     component={"fieldset"}
//                     error={errorForm.situacao}
//                       sx={{
//                       '& .MuiInputLabel-root': {
//                         color: theme.palette.text.secondary,
//                         '&.Mui-focused': {
//                           color: theme.palette.text.secondary,
//                         },
//                       },
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: theme.palette.divider,
//                         },
//                         '&:hover fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                       },
//                     }}>
//                     <FormLabel
//                       id="situacao-equipamento"
//                       sx={{
//                         color: situacao !== null ? theme.palette.text.primary : theme.palette.text.secondary,
//                         '&.Mui-focused': {
//                           color: theme.palette.text.primary,
//                         },
//                         '&.Mui-error': {
//                           color: theme.palette.error.main,
//                         },
//                       }}
//                       >Situação
//                     </FormLabel>
//                     <RadioGroup
//                       row
//                       aria-labelledby="situacao-equipamento"
//                       name="situacao-equipamento"
//                       value={situacao}
//                       onChange={(e) => setSituacao(e.target.value as BemSituacaoEnum)}
//                       >
//                       <FormControlLabel
//                         value={BemSituacaoEnum.OBSOLETO}
//                         control={<Radio />} label="Obsoleto"
//                         sx={{
//                           '& .MuiFormControlLabel-label': {
//                             color: situacao === BemSituacaoEnum.OBSOLETO ? theme.palette.text.primary : theme.palette.text.secondary,
//                           },
//                         }}
//                       />
//                       <FormControlLabel
//                         value={BemSituacaoEnum.NAO_REPARADO}
//                         control={<Radio />} label="Não reparado"
//                         sx={{
//                           '& .MuiFormControlLabel-label': {
//                             color: situacao === BemSituacaoEnum.NAO_REPARADO ? theme.palette.text.primary : theme.palette.text.secondary,
//                           },
//                         }}
//                       />
//                     </RadioGroup>
//                     {errorForm.situacao && (
//                       <FormHelperText>Selecione uma situação para o equipamento.</FormHelperText>
//                     )}
//                   </FormControl>
//                 </Grid>

//                 <Grid item xs={12}>
//                   <TextField
//                     label="Problema"
//                     fullWidth
//                     multiline
//                     rows={4}
//                     value={problema}
//                     onChange={(e) => setProblema(e.target.value)}
//                     error={errorForm.problema}
//                     helperText={errorForm.problema ? "O problema deve ter pelo menos 5 caracteres" : ""}
//                     sx={{
//                       '& .MuiInputLabel-root': {
//                         color: theme.palette.text.secondary,
//                         '&.Mui-focused': {
//                           color: theme.palette.text.secondary,
//                         },
//                       },
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: theme.palette.divider,
//                         },
//                         '&:hover fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <TextField
//                     label="Justificativa"
//                     fullWidth
//                     multiline
//                     rows={4}
//                     value={justificativa}
//                     onChange={(e) => setJustificativa(e.target.value)}
//                     error={errorForm.justificativa}
//                     helperText={errorForm.justificativa ? "A justificativa deve ter pelo menos 10 caracteres" : ""}
//                     sx={{
//                       '& .MuiInputLabel-root': {
//                         color: theme.palette.text.secondary,
//                         '&.Mui-focused': {
//                           color: theme.palette.text.secondary,
//                         },
//                       },
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: theme.palette.divider,
//                         },
//                         '&:hover fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <TextField
//                     label="Observação"
//                     fullWidth
//                     multiline
//                     rows={4}
//                     value={observacao}
//                     onChange={(e) => setObservacao(e.target.value)}
//                     error={errorForm.observacao}
//                     helperText={errorForm.observacao ? "A observação deve ter pelo menos 10 caracteres" : ""}
//                     sx={{
//                       '& .MuiInputLabel-root': {
//                         color: theme.palette.text.secondary,
//                         '&.Mui-focused': {
//                           color: theme.palette.text.secondary,
//                         },
//                       },
//                       '& .MuiOutlinedInput-root': {
//                         '& fieldset': {
//                           borderColor: theme.palette.divider,
//                         },
//                         '&:hover fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                         '&.Mui-focused fieldset': {
//                           borderColor: theme.palette.text.secondary,
//                         },
//                       },
//                     }}
//                   />
//                 </Grid>

//                 {/* Botão de confirmar cadastro/edição de laudo */}
//                 <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
//                   <Button
//                     variant="contained"
//                     type="submit"
//                     size="large"
//                     sx={{
//                       bgcolor: 'primary.main',
//                       '&:hover': {
//                         bgcolor: 'primary.dark',
//                       }
//                     }}
//                   >
//                     {modoEdicao ? "Salvar Edição" : "Cadastrar Laudo"}
//                   </Button>
//                 </Grid>
//               </Grid>
//             </Box>
//            </Box>
//     </Modal>
//     );
// };

// export default FormularioLaudo;
