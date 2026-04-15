import { Suspense } from "react";
import CertificadosPage from "./certificados-page";

export default function Page() {
  return (
    <Suspense>
      <CertificadosPage/>
    </Suspense>
  );
}
