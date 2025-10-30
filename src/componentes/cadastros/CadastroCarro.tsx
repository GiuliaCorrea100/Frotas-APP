import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarroDto, CarroService } from "../../api/CarroService";
import { TipoCombustivel, TipoCombustivelService } from "../../api/tipoCombustivelService";
import Menu from "../Menu";

const CadastroCarro: React.FC = () => {
  const [placa, setPlaca] = useState<string>("");
  const [odometro, setOdometro] = useState<string>("");
  const [modelo, setModelo] = useState<string>("");
  const [ano, setAno] = useState("");
  const [tombo, setTombo] = useState<string>("");
  const [localidadeFisica, setLocalidadeFisica] = useState<string>("");
  const [cadastroConcluido, setCadastroConcluido] = useState<boolean>(false);
const [tipoCombustivelSelecionado, setTipoCombustivelSelecionado] = useState<TipoCombustivel | null>(null);
  const [tiposCombustivelDisponiveis, setTiposCombustivelDisponiveis] = useState<TipoCombustivel[]>([]);
  const [erroTipoCombustivel, setErroTipoCombustivel] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const buscarTipos = async () => {
      try {
        const tipos = await TipoCombustivelService.listar();
        setTiposCombustivelDisponiveis(tipos.data);
      } catch (error) {
        console.error("Erro ao carregar tipos de combustível:", error);
      }
    };
    buscarTipos();
  }, []);

  const handleSelectChange = (e: SelectChangeEvent) => {
  const idSelecionado = e.target.value;
  const tipoSelecionado = tiposCombustivelDisponiveis.find(
    tipo => tipo.idTipoCombustivel?.toString() === idSelecionado
  );
  
  if (tipoSelecionado) {
    setTipoCombustivelSelecionado(tipoSelecionado);
    setErroTipoCombustivel("");
  }
};

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!placa || !odometro || !modelo || !ano || !tombo || !localidadeFisica || !tipoCombustivelSelecionado) {
      alert("Preencha todos os campos!");
      return;
    }

    if (placa.replace(/[^A-Za-z0-9]/g, "").length !== 7) {
      alert("A placa deve ter 7 caracteres alfanuméricos!");
      return;
    }

    const novoCarro: CarroDto = {
      placa,
      odometro,
      modelo,
      ano: Number(ano),
      tombo: Number(tombo),
      qrCode: "",
      localidadeFisica: localidadeFisica,
      situacao: "DISPONIVEL",
      ativo: true,
      tipoCombustivel: tipoCombustivelSelecionado,
    };

    try {
      const carroCadastrado = await CarroService.criar(novoCarro);
      setCadastroConcluido(true);
      navigate('/ListaCarros', {
        state: {
          carroCadastrado,
          situacaoFiltro: "DISPONIVEL",
          filtroAtivo: true
        }
      });
    } catch (error) {
      alert("Erro ao cadastrar veículo.");
      console.error(error);
    }
  };

  const formatarPlaca = (valor: string): string => {
    return valor.toUpperCase().replace(/[^A-Za-z0-9]/g, "").slice(0, 7);
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
                onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
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
                onChange={(e) => setOdometro(e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo do Veículo</label>
              <input
                type="text"
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: Onix 1.0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ano">Ano do Veículo</label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tombo">Tombo</label>
              <input
                type="number"
                id="tombo"
                value={tombo}
                onChange={(e) => setTombo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="localidadeFisica">Localidade Física</label>
              <input
                type="text"
                id="localidadeFisica"
                value={localidadeFisica}
                onChange={(e) => setLocalidadeFisica(e.target.value)}
                placeholder="Ex: Porto Velho"
              />
            </div>

            <FormControl fullWidth margin="normal" error={!!erroTipoCombustivel}>
            <InputLabel>Tipo de Combustível</InputLabel>
            <Select
                  value={tipoCombustivelSelecionado?.idTipoCombustivel?.toString() || ""}
                  onChange={handleSelectChange}
                  label="Tipo de Combustível"
                >
                  {tiposCombustivelDisponiveis.map((tipo) => (
                    <MenuItem
                      key={tipo.idTipoCombustivel}
                      value={tipo.idTipoCombustivel?.toString()}
                    >
                      {tipo.nome}
                    </MenuItem>
                  ))}
                </Select>

            {erroTipoCombustivel && (
              <Typography color="error">{erroTipoCombustivel}</Typography>
            )}
          </FormControl>

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
              <p><strong>Ano:</strong> {ano}</p>
              <p><strong>Tombo:</strong> {tombo}</p>
              <p><strong>Localidade Física:</strong> {localidadeFisica}</p>
            </div>
            <button
              className="button-main"
              onClick={() => {
                setCadastroConcluido(false);
                setPlaca("");
                setOdometro("");
                setModelo("");
                setAno("");
                setTombo("");
                setLocalidadeFisica("");
                setTipoCombustivelSelecionado(null);
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
