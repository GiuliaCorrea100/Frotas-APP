import React, { ChangeEvent, FormEvent, useState } from "react";
import Menu from "../Menu";

const CadastroMotorista2: React.FC = () => {
  const [classificacao, setClassificacao] = useState<string>("B");
  const [dataEmissao, setDataEmissao] = useState<string>("");
  const [dataValidade, setDataValidade] = useState<string>("");
  const [cadastroConcluido, setCadastroConcluido] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!dataEmissao || !dataValidade) {
      alert("Preencha todas as datas!");
      return;
    }

    if (new Date(dataValidade) < new Date(dataEmissao)) {
      alert("A data de validade deve vir depois da data de emissão!");
      return;
    }

    setCadastroConcluido(true);
  };

  const dataAtual = new Date().toISOString().split("T")[0];

  return (
    <div className="pagina">
      <Menu />

      <div className="cadastro-container">
        <header className="header">
          <h2>Cadastro motorista - carteira</h2>
        </header>

        {!cadastroConcluido ? (
          <form onSubmit={handleSubmit} className="cadastro-form">
            <div className="form-group">
              <label htmlFor="classificacao">Classificação</label>
              <select
                id="classificacao"
                value={classificacao}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setClassificacao(e.target.value)
                }
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dataEmissao">Data de emissão</label>
              <input
                type="date"
                id="dataEmissao"
                value={dataEmissao}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDataEmissao(e.target.value)
                }
                max={dataAtual}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dataValidade">Data de validade</label>
              <input
                type="date"
                id="dataValidade"
                value={dataValidade}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDataValidade(e.target.value)
                }
                min={dataEmissao || dataAtual}
              />
            </div>

            <button type="submit" className="button-main">
              Concluir cadastro
            </button>
          </form>
        ) : (
          <div>
            <h2>Usuário cadastrado com sucesso!</h2>
            <div>
              <p>
                <strong>Classificação: </strong>
                {classificacao}
              </p>
              <p>
                <strong>Data de emissão: </strong>
                {new Date(dataEmissao).toLocaleDateString()}
              </p>
              <p>
                <strong>Data de validade: </strong>
                {new Date(dataValidade).toLocaleDateString()}
              </p>
            </div>
            <button
              className="button-main"
              onClick={() => {
                alert("Redirecionamento para o menu.");
              }}
            >
              Voltar para o menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CadastroMotorista2;
