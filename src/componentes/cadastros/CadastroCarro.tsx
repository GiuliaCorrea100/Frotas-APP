import React, { ChangeEvent, FormEvent, useState } from "react";
import Menu from "../Menu";

// tipo do carro
type Carro = {
  placa: string;
  odometro: string;
  modelo: string;
};

const CadastroCarro: React.FC = () => {
  const [placa, setPlaca] = useState<string>("");
  const [odometro, setOdometro] = useState<string>("");
  const [modelo, setModelo] = useState<string>("");
  const [cadastroConcluido, setCadastroConcluido] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!placa || !odometro || !modelo) {
      alert("Preencha todos os campos!");
      return;
    }

    if (placa.replace(/[^A-Za-z0-9]/g, "").length !== 7) {
      alert("A placa deve ter 7 caracteres alfanuméricos!");
      return;
    }

    // Aqui você poderia salvar os dados no backend ou em um estado global
    setCadastroConcluido(true);
  };

  const formatarPlaca = (valor: string): string => {
    let placaFormatada = valor.toUpperCase().replace(/[^A-Za-z0-9]/g, "");

    if (placaFormatada.length > 3) {
      placaFormatada = placaFormatada.slice(0, 3) + placaFormatada.slice(3);
    }
    if (placaFormatada.length > 4) {
      placaFormatada = placaFormatada.slice(0, 4) + placaFormatada.slice(4);
    }

    return placaFormatada;
  };

  return (
    <div className="pagina">
      <Menu />

      <div className="cadastro-container">
        <header className="header">
          <h2>Cadastro de Veículo</h2>
        </header>

        {!cadastroConcluido ? (
          <form onSubmit={handleSubmit} className="cadastro-form">
            <div className="form-group">
              <label htmlFor="placa">Placa do Veículo</label>
              <input
                type="text"
                id="placa"
                value={placa}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPlaca(formatarPlaca(e.target.value))
                }
                placeholder="AAA0A00"
                maxLength={7}
              />
            </div>

            <div className="form-group">
              <label htmlFor="odometro">Odômetro (km)</label>
              <input
                type="number"
                id="odometro"
                value={odometro}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setOdometro(e.target.value)
                }
                min="0"
                step="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo do Veículo</label>
              <input
                type="text"
                id="modelo"
                value={modelo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setModelo(e.target.value)
                }
                placeholder="Ex: Onix 1.0"
              />
            </div>

            <button type="submit" className="button-main">
              Concluir cadastro
            </button>
          </form>
        ) : (
          <div className="cadastro-multa-sucesso">
            <h2>Veículo cadastrado com sucesso!</h2>
            <div className="detalhes-multa">
              <p><strong>Placa:</strong> {placa}</p>
              <p><strong>Odômetro:</strong> {odometro} km</p>
              <p><strong>Modelo:</strong> {modelo}</p>
            </div>
            <button
              className="button-main"
              onClick={() => {
                setCadastroConcluido(false);
                setPlaca("");
                setOdometro("");
                setModelo("");
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

export default CadastroCarro;
