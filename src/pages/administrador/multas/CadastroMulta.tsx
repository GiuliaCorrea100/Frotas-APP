// import React, { useState } from "react";
// import Menu from "../Menu";
// import { cadastrarMulta } from '../../api/multaService';

// // Definindo o tipo 'Multa' para garantir que os dados do formulário estejam bem tipados
// type Multa = {
//     codigo: string;
//     classificacao: string;
//     valor: string;
//     placa: string;
//     horario: string;
//     numeroAuto: string;
// };

// const CadastroMulta: React.FC = () => {
//     // Definindo o estado 'multa' com a tipagem correta para garantir que os dados estejam corretos
//     const [multa, setMulta] = useState<Multa>({
//         codigo: '',
//         classificacao: '',
//         valor: '',
//         placa: '',
//         horario: '',
//         numeroAuto: ''
//     });

//     const [cadastroConcluido, setCadastroConcluido] = useState<boolean>(false);

//     // Função de alteração para cada input, atualizando o estado conforme o nome do campo
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setMulta(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Função de envio do formulário
//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         try {
//           await cadastrarMulta(multa);
//           setCadastroConcluido(true);
//         } catch (error) {
//           alert('Erro ao cadastrar multa. Por favor, tente novamente.');
//           console.error('Erro:', error);
//         }
//       };

//     return (
//         <div className="pagina">
//             <Menu />

//             <div className="cadastro-multa-container">
//                 <header className="header">
//                     <h2>Cadastro de Multa</h2>
//                 </header>

//                 {/* Exibindo o formulário ou a tela de sucesso, dependendo do estado do cadastro */}
//                 {!cadastroConcluido ? (
//                     <form onSubmit={handleSubmit} className="cadastro-multa">
//                         <div className="form-group">
//                             <label htmlFor="codigo">Código da Infração</label>
//                             <input
//                                 type="text"
//                                 id="codigo"
//                                 name="codigo"
//                                 value={multa.codigo}
//                                 onChange={handleChange}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="classificacao">Classificação da Infração</label>
//                             <input
//                                 type="text"
//                                 id="classificacao"
//                                 name="classificacao"
//                                 value={multa.classificacao}
//                                 onChange={handleChange}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="valor">Valor (R$)</label>
//                             <input
//                                 type="text"
//                                 id="valor"
//                                 name="valor"
//                                 value={multa.valor}
//                                 onChange={handleChange}
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="placa">Placa do Veículo</label>
//                             <input
//                                 type="text"
//                                 id="placa"
//                                 name="placa"
//                                 value={multa.placa}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="horario">Data e horário da Infração</label>
//                             <input
//                                 type="datetime-local"
//                                 id="horario"
//                                 name="horario"
//                                 value={multa.horario}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="numeroAuto">Número do Auto</label>
//                             <input
//                                 type="text"
//                                 id="numeroAuto"
//                                 name="numeroAuto"
//                                 value={multa.numeroAuto}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </div>

//                         <button type="submit" className="button-main">Cadastrar Multa</button>
//                     </form>
//                 ) : (
//                     <div className="cadastro-multa-sucesso">
//                         <h2>Multa cadastrada com sucesso!</h2>
//                         <div className="detalhes-multa">
//                             <p><strong>Código: </strong> {multa.codigo}</p>
//                             <p><strong>Classificação: </strong> {multa.classificacao}</p>
//                             <p><strong>Valor: </strong> R$ {multa.valor}</p>
//                             <p><strong>Placa: </strong> {multa.placa}</p>
//                             <p><strong>Horário: </strong> {new Date(multa.horario).toLocaleString()}</p>
//                             <p><strong>Número do Auto: </strong> {multa.numeroAuto}</p>
//                         </div>
//                         <button
//                             className="button-main"
//                             onClick={() => {
//                                 setCadastroConcluido(false); // Resetando o estado de cadastro
//                                 setMulta({
//                                     codigo: '',
//                                     classificacao: '',
//                                     valor: '',
//                                     placa: '',
//                                     horario: '',
//                                     numeroAuto: ''
//                                 });
//                             }}
//                         >
//                             Cadastrar Nova Multa / voltar para o menu
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default CadastroMulta;
