// src/data/planosData.ts

// Definimos o "formato" do plano
export type Plano = {
    tipo: 'Futevôlei' | 'Beach Tennis';
    titulo: string;
    preco: string;
    destacado: boolean
    features: string[];
};

export const planos: Plano[] = [
    {
        tipo: 'Futevôlei',
        titulo: 'Futevôlei 2x - Semestral',
        preco: 'R$ 199,90',
        destacado: true, // Este será nosso card em destaque
        features: [
            '2x Aulas de Futevôlei Semanais',
            'Sem Taxa de Matrícula',
            'Desconto no Day Use',
            'Pagamento Recorrente',
        ],
    },
    {
        tipo: 'Futevôlei',
        titulo: 'Futevôlei 2x - Trimestral',
        preco: 'R$ 229,90',
        destacado: false,
        features: [
            '2x Aula de Futevôlei Semanal',
            'Sem Taxa de Matrícula',
            'Desconto no Day Use',
            'Pagamento Recorrente',
        ],
    },
    {
        tipo: 'Futevôlei',
        titulo: 'Futevôlei 2x - Mensal',
        preco: 'R$ 249,90',
        destacado: false,
        features: [
            '2x Aula de Futevôlei Semanal',
            'Sem Taxa de Matrícula',
            'Desconto no Day Use',
            'Pagamento Recorrente',
        ],
    },
    {
        tipo: 'Beach Tennis',
        titulo: 'Beach Tennis 2x - Semestral',
        preco: 'R$ 399,90',
        destacado: true,
        features: [
            '2x Aulas de Beach Tennis Semanais',
            'Sem Taxa de Matrícula',
            'Descontos em Serviços',
            'Pagamento Recorrente',
        ],
    },
    {
        tipo: 'Beach Tennis',
        titulo: 'Beach Tennis 2x - Trimestral',
        preco: 'R$ 429,90',
        destacado: false,
        features: [
            '2x Aula de Beach Tennis Semanal',
            'Sem Taxa de Matrícula',
            'Descontos em Serviços',
            'Pagamento Recorrente',
        ],
    },
    {
        tipo: 'Beach Tennis',
        titulo: 'Beach Tennis 2x - Mensal',
        preco: 'R$ 449,90',
        destacado: false,
        features: [
            '2x Aula de Beach Tennis Semanal',
            'Sem Taxa de Matrícula',
            'Descontos em Serviços',
            'Pagamento Recorrente',
        ],
    }
]