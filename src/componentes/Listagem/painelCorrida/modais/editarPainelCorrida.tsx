// import React, { useState } from 'react';
// import { 
//   Modal,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   CircularProgress,
// } from '@mui/material';
// import axiosConnect from '../../../../services/axiosConnect';

// interface EditarInfoCorridaProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: (message: string) => void;
//   onError: (error: any) => void;
//   motorista: string;
//   veiculo: string;
//   dataInicio: Date;
//   dataFim: Date;
// }


// const salvarEdicaoCorrida : React.FC <EditarInfoCorridaProps> = ({
//   open,
//   onClose,
//   onSuccess,
//   onError,
//   motorista,
//   veiculo,
//   dataInicio,
//   dataFim,
//   }) => {
//   //const [motorista, setMotorista] = useState();
//   //const [veiculo, setVeiculo] = useState();
//   //const [dataInicio, setDataInicio] = useState();
//   //const [dataFim, setDataFim] = useState();

//   //const [loading, setLoading] = useState(false);

//   const handleSubmit = async (event: React.FormEvent) => {

//     try{
//         await axiosConnect.put('/corridas/${idCorrida}$');
//               onSuccess('Edições salvas com sucesso!');
//               onClose();
//     }catch(error){
//       console.error('Erro ao salvar edições:', error);
//       //onError(error);
//     }finally{
//       setLoading(false);
//     }
//   }

// };

// export default salvarEdicaoCorrida;

