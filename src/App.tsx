import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClientDetailPage } from "@/pages/ClientDetailPage";
import { ClientsListPage } from "@/pages/ClientsListPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<ClientsListPage />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
