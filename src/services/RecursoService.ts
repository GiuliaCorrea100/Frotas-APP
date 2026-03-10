import axiosConnect from "./axios/axiosConnect";

export interface recursoDto{
    justificativa: string;
    urlArquivo?: string;
    idMulta: number;
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


}