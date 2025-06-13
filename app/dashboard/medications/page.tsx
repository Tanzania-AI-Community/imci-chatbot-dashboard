import { Metadata } from "next";
import { MedicationsView } from "@/components/medications/medications-view";

export const metadata: Metadata = {
  title: "Medications",
  description: "Manage medications database",
};

export default function MedicationsPage() {
  return <MedicationsView />;
}
