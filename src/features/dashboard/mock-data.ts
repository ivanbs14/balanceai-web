import type { DashboardMonthData } from "./types";

export const dashboardMonths: DashboardMonthData[] = [
  {
    id: "2026-01",
    label: "Janeiro",
    summary: {
      totalExpenses: 6968.54,
      balance: -23.54,
    },
    fixedCosts: [
      {
        id: "rent",
        name: "Aluguel",
        paymentType: "Debito",
        paid: true,
        amount: 3200,
      },
      {
        id: "condo",
        name: "Condominio",
        paymentType: "Debito",
        paid: true,
        amount: 850,
      },
      {
        id: "energy",
        name: "Energia",
        paymentType: "Debito",
        paid: false,
        amount: 245.68,
      },
    ],
    creditCard: [
      {
        id: "market",
        name: "Supermercado",
        paymentType: "Debito",
        installmentLabel: "1/1",
        amount: 840.3,
      },
      {
        id: "prime",
        name: "Amazon Prime",
        paymentType: "Debito",
        installmentLabel: "1/1",
        amount: 14.9,
      },
    ],
    income: [
      {
        id: "salary",
        label: "Salario Mensal",
        amount: 6500,
      },
      {
        id: "extra",
        label: "Renda Extra",
        amount: 445,
      },
    ],
    expenses: [
      {
        id: "debit",
        label: "Debito",
        amount: 4504.51,
      },
      {
        id: "nubank",
        label: "Nubank",
        amount: 770.3,
      },
      {
        id: "inter",
        label: "Inter",
        amount: 1093.73,
      },
      {
        id: "travel",
        label: "Viagem",
        amount: 600,
      },
    ],
    investments: [
      {
        id: "emergency",
        label: "Reserva de Emergencia",
        amount: 500,
      },
      {
        id: "ipca",
        label: "Renda Fixa IPCA+",
        amount: 200,
      },
    ],
    categories: [
      {
        id: "food",
        label: "Alimentacao",
        percentage: 45,
        colorClassName: "bg-[#cf0b74]",
      },
      {
        id: "housing",
        label: "Moradia",
        percentage: 30,
        colorClassName: "bg-[#8d4d76]",
      },
      {
        id: "other",
        label: "Outros",
        percentage: 25,
        colorClassName: "bg-[#9e7b88]",
      },
    ],
  },
  {
    id: "2026-02",
    label: "Fevereiro",
    summary: {
      totalExpenses: 5824.2,
      balance: 1120.8,
    },
    fixedCosts: [
      {
        id: "rent",
        name: "Aluguel",
        paymentType: "Debito",
        paid: true,
        amount: 3200,
      },
      {
        id: "condo",
        name: "Condominio",
        paymentType: "Debito",
        paid: true,
        amount: 850,
      },
      {
        id: "internet",
        name: "Internet",
        paymentType: "Debito",
        paid: true,
        amount: 139.9,
      },
    ],
    creditCard: [
      {
        id: "course",
        name: "Curso UX",
        paymentType: "Credito",
        installmentLabel: "2/6",
        amount: 199.9,
      },
      {
        id: "pharmacy",
        name: "Farmacia",
        paymentType: "Credito",
        installmentLabel: "1/1",
        amount: 84.4,
      },
      {
        id: "streaming",
        name: "Streaming",
        paymentType: "Credito",
        installmentLabel: "1/1",
        amount: 39.9,
      },
    ],
    income: [
      {
        id: "salary",
        label: "Salario Mensal",
        amount: 6500,
      },
      {
        id: "bonus",
        label: "Bonus",
        amount: 445,
      },
    ],
    expenses: [
      {
        id: "debit",
        label: "Debito",
        amount: 3610.2,
      },
      {
        id: "card",
        label: "Cartao",
        amount: 1240.6,
      },
      {
        id: "health",
        label: "Saude",
        amount: 350,
      },
      {
        id: "transport",
        label: "Transporte",
        amount: 623.4,
      },
    ],
    investments: [
      {
        id: "emergency",
        label: "Reserva de Emergencia",
        amount: 700,
      },
      {
        id: "cdb",
        label: "CDB Pos-fixado",
        amount: 600,
      },
    ],
    categories: [
      {
        id: "housing",
        label: "Moradia",
        percentage: 38,
        colorClassName: "bg-[#cf0b74]",
      },
      {
        id: "mobility",
        label: "Transporte",
        percentage: 22,
        colorClassName: "bg-[#8d4d76]",
      },
      {
        id: "health",
        label: "Saude",
        percentage: 18,
        colorClassName: "bg-[#9e7b88]",
      },
      {
        id: "other",
        label: "Outros",
        percentage: 22,
        colorClassName: "bg-[#c796ad]",
      },
    ],
  },
];

export const defaultDashboardMonthId = dashboardMonths[0]?.id ?? "";
