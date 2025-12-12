// src/data/planosData.ts

// Definimos o "formato" do plano
export type Plano = {
    tipo: 'Futevôlei' | 'Beach Tennis' | 'Locação';
    titulo: string;
    preco: string;
    unidade?: string;
    destacado: boolean
    features: string[];
};

export const planos: Plano[] = [
    {
        tipo: 'Futevôlei',
        titulo: 'Futevôlei 2x - Semestral',
        preco: 'R$ 195,00',
        unidade: '/por mês',
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
        preco: 'R$ 210,00',
        unidade: '/por mês',
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
        preco: 'R$ 230,00',
        unidade: '/por mês',
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
        titulo: 'Beach Tennis - Trimestral',
        preco: 'R$ 380,00',
        unidade: '/por mês',
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
        titulo: 'Beach Tennis - Mensal',
        preco: 'R$ 400,00',
        unidade: '/por mês',
        destacado: false,
        features: [
            '2x Aula de Beach Tennis Semanal',
            'Sem Taxa de Matrícula',
            'Descontos em Serviços',
            'Pagamento Recorrente',
        ],
    },
    {
        tipo: 'Locação',
        titulo: 'Locação de Quadra + Churrasqueira',
        preco: 'R$ 180,00',
        unidade: '/por hora',
        destacado: true,
        features: [
            '1 Hora de Quadra Exclusiva',
            'Espaço Gourmet Exclusivo',
            'Acesso à Estrutura da Arena',
            'Bolas Inclusas',
        ],
    },
    {
        tipo: 'Locação',
        titulo: 'Locação de Quadra (ALUNO)',
        preco: 'R$ 80,00',
        unidade: '/por hora',
        destacado: false,
        features: [
            '1 Hora de Quadra Exclusiva',
            'Acesso à Estrutura da Arena',
            'Bolas Inclusas',
        ],
    },
    {
        tipo: 'Locação',
        titulo: 'Locação de Quadra (NÃO ALUNO)',
        preco: 'R$ 100,00',
        unidade: '/por hora',
        destacado: false,
        features: [
            '1 Hora de Quadra Exclusiva',
            'Acesso à Estrutura da Arena',
            'Bolas Inclusas',
        ],
    }
]