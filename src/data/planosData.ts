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
        preco: 'R$ 199,90',
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
        preco: 'R$ 229,90',
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
        preco: 'R$ 249,90',
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
        titulo: 'Beach Tennis 2x - Semestral',
        preco: 'R$ 399,90',
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
        titulo: 'Beach Tennis 2x - Trimestral',
        preco: 'R$ 429,90',
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
        tipo: 'Beach Tennis',
        titulo: 'Beach Tennis 2x - Mensal',
        preco: 'R$ 449,90',
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
        titulo: 'Locação de Quadra (1 hora) + Churrasqueira',
        preco: 'R$ 129,90',
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
        titulo: 'Locação de Quadra',
        preco: 'R$ 99,90',
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
        titulo: 'Locação Churrasqueira',
        preco: 'R$ 69,90',
        unidade: '/por hora',
        destacado: false,
        features: [
            'Espaço Gourmet Exclusivo',
        ],
    }
]