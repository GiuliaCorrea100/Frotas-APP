import axiosConnect from "./axios/axiosConnect";

export interface recursoDto{
    justificativa: string;
    urlArquivo?: string;
    idMulta: number;
    justificativaRejeicao: string;
}

export class RecursoService {

    static async solicitarRecurso(formData: FormData): Promise<any>{
        try {
            const response = await axiosConnect.post("/recurso", formData, {
                headers: {
                "Content-Type": "multipart/form-data",
                    },
                });
            return response.data;
        } catch (error) {
            console.error("Erro ao cadastrar recurso com arquivo:", error);
            throw error;
        }
    }

    static async buscarPorMulta(idMulta: number): Promise<recursoDto | null> {
        try {
            const response = await axiosConnect.get(`/recurso/multa/${idMulta}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar recurso:", error);
            return null;
        }
    }

    static async rejeitarRecurso(idMulta: number, justificativaRejeicao: string): Promise<any> {
        try {
            const response = await axiosConnect.put(`/recurso/rejeitar/${idMulta}`, {
                justificativaRejeicao,
            });
            return response.data;
        } catch (error) {
            console.error("Erro ao rejeitar recurso:", error);
            throw error;
        }
    }
}