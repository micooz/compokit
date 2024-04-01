import { ScrollTop } from "primereact/scrolltop";
import { ConfirmDialog } from "primereact/confirmdialog";

import { ToneLoader } from "@/components/ToneLoader";

import { Header } from "./components/Header";
import { Container } from "./components/Container";

export default function Home() {
  return (
    <main className="pb-8">
      <Header />
      <ToneLoader />
      <Container />
      <ConfirmDialog />
      <ScrollTop />
    </main>
  );
}
