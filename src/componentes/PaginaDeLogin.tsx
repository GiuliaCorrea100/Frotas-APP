import React, { ChangeEvent, useState } from "react";
import logoUNIR from "../assets/logoUNIR.png";
import { loginUser } from '../api/authService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PaginaDeLogin: React.FC = () => {
  // Tipagem dos estados
  const navigate = useNavigate();
  const { login } = useAuth();
  const [cpf, setCpf] = useState<string>("");
  const [cpfError, setCpfError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Validação do formulário
  const isFormValid: boolean = cpf.length === 11 && password.trim() !== "";

  // Função de manipulação do campo CPF
  const handleCPF = (event: ChangeEvent<HTMLInputElement>): void => {
    let cpf = event.target.value;
    cpf = cpf.replace(/\D/g, ""); 

    // Limita o CPF para 11 caracteres
    if (cpf.length > 11) {
      cpf = cpf.slice(0, 11);
    }

    setCpf(cpf);
    setCpfError(cpf.length !== 11);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setPasswordError(newPassword.trim() === ""); // Validação de senha não vazia
  };

  // Função para submeter o formulário
  const handleSubmit = async (): Promise<void> => {
    if (isFormValid) {
      try {
        const userData = await loginUser({ cpf, password });
        console.log("Login realizado com sucesso!", userData);
        // Redirecionar para a página principal ou dashboard
        navigate('/menu');
      } catch (error) {
        console.error("Erro ao realizar login:", error);
        alert("CPF ou senha incorretos");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo da UNIR */}
        <img src={logoUNIR} alt="Logo" className="login-logo" />

        {/* Campo CPF */}
        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={handleCPF}
              className={`${cpfError ? "input-error" : ""}`}
            />
          </div>
          {cpfError && <span className="error-message">CPF deve ter 11 dígitos.</span>}
        </div>

        {/* Campo Senha */}
        <div className="input-group">
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={handlePasswordChange}
            className={`${passwordError ? "input-error" : ""}`}
          />
        </div>
        {passwordError && <span className="error-message">Senha não pode ser vazia.</span>}
      </div>
      
        {/* Botão de Login */}
        <button
          className="button-main"
          onClick={handleSubmit}
          disabled={!isFormValid} // Desabilita o botão se o formulário não for válido
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default PaginaDeLogin;
