import type { Metadata } from "next";
import CreationsClient from "@/components/creations/CreationsClient";

export const metadata: Metadata = {
  title: "Creations | Sarayu Marri",
  description: "Projects by Sarayu Marri, from hackathon apps to Unity games.",
};

export default function Creations() {
  return <CreationsClient />;
}
