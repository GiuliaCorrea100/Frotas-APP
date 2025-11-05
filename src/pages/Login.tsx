import React, { ChangeEvent, useState } from "react";
import logoUNIR from "../assets/logoUNIR.png";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosConnect from "../services/axios/axiosConnect";


const PaginaDeLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [cpf, setCpf] = useState<string>("");
  const [cpfError, setCpfError] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);

  const isFormValid: boolean = cpf.length === 11 && password.trim() !== "";

  const handleCPF = (event: ChangeEvent<HTMLInputElement>): void => {
    let cpf = event.target.value;
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length > 11) {
      cpf = cpf.slice(0, 11);
    }

    setCpf(cpf);
    setCpfError(cpf.length !== 11);
  };

  const handlePassword = (event: ChangeEvent<HTMLInputElement>): void => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setPasswordError(newPassword.trim() === "");
  };

  const handleSubmit = async (): Promise<void> => {
    if (isFormValid) {
      try {
        const response = await axiosConnect.post('/auth/login', {
          username: cpf,
          password: password,
        });

        const { token, username, administrador, nome, email } = response.data;
        login(token, username, administrador, nome, email);
        navigate('/menu');
      } catch (error) {
        
        console.error("Erro ao realizar login:", error);
        alert("CPF ou senha incorretos");
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && isFormValid) {
      handleSubmit();
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logoUNIR} alt="Logo" className="login-logo" />

        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={handleCPF}
              onKeyDown={handleKeyDown}
              className={`${cpfError ? "input-error" : ""}`}
            />
          </div>
          {cpfError && <span className="error-message">CPF deve ter 11 dígitos.</span>}
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={handlePassword}
              onKeyDown={handleKeyDown}
              className={`${passwordError ? "input-error" : ""}`}
            />
          </div>
          {passwordError && <span className="error-message">Senha não pode ser vazia.</span>}
        </div>

        <button
          className="button-main"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default PaginaDeLogin;