import React, { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import Menu from "../Menu";

const CadastroMotorista: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [rg, setRg] = useState<string>("");
  const [erro, setErro] = useState<string>("");

  //  envio do formulário
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!nome || !cpf || !rg) {
      setErro("Preencha todos os campos");
      return;
    }

    setErro("");
    navigate("/CadastroMotorista2");
  };

  return (
    <div className="pagina">
      <Menu />

      <div className="cadastro-container">
        <header className="header">
          <h2>Cadastro de Motorista</h2>
        </header>

        <form onSubmit={handleSubmit} className="cadastro-form">
          {erro && <div className="erro-message">{erro}</div>}

          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
              placeholder="Digitar nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCpf(e.target.value)}
              placeholder="Digitar CPF"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rg">RG</label>
            <input
              type="text"
              id="rg"
              value={rg}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRg(e.target.value)}
              placeholder="Digite RG"
            />
          </div>

          <button type="submit" className="button-main">
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastroMotorista;
