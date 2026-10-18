import type { IconName } from "@/components/icons";

export type DemoRole =
  | "demandeur"
  | "recipient"
  | "secretariat"
  | "ministre"
  | "dgt"
  | "dr"
  | "service"
  | "regisseur";

export type DemoPage =
  | "overview"
  | "dossiers"
  | "new-dossier"
  | "recipients"
  | "complements"
  | "recours"
  | "payments"
  | "ceremonies"
  | "remises"
  | "notifications"
  | "activity"
  | "profile"
  | "documents"
  | "transmissions"
  | "decisions"
  | "relances"
  | "agenda"
  | "instruction"
  | "eligibility"
  | "adjustments"
  | "delegations"
  | "attendance"
  | "campaigns"
  | "stock"
  | "movements"
  | "supplies"
  | "orders"
  | "deliveries"
  | "withdrawals";

export type StatusTone = "neutral" | "info" | "warning" | "success" | "danger";

export interface DemoStatus {
  label: string;
  tone: StatusTone;
}

export interface DemoRecipient {
  id: string;
  name: string;
  company: string;
  role: string;
  seniority: number;
  medal: "Bronze" | "Argent" | "Or";
  instruction: "Validé" | "En attente" | "À compléter" | "Refusé";
  documents: string[];
}

export interface DemoDossier {
  reference: string;
  campaign: string;
  applicant: string;
  submitted: string;
  updated: string;
  initialRecipient: string;
  recipientCount: number;
  status: DemoStatus;
  payment: DemoStatus;
  ceremony?: string;
  location?: string;
  recipients: DemoRecipient[];
}

export interface DemoNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  tone: StatusTone;
  read: boolean;
  reference?: string;
}

export interface DemoNavItem {
  label: string;
  page: DemoPage;
  icon: IconName;
}

export interface DemoRoleConfig {
  label: string;
  shortLabel: string;
  description: string;
  accent: "green" | "blue" | "gold";
  nav: DemoNavItem[];
}