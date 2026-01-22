import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/main/LandingPage"

import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import ProtectedRoute from "./components/ProtectedRoute"

import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminPegawaiPage from "./pages/admin/pegawai/PegawaiPage"
import LaporanAdminPage from "./pages/admin/laporan/LaporanAdminPage"

import PegawaiDashboard from "./pages/pegawai/PegawaiDashboard"
import PegawaiBarangPage from "./pages/pegawai/barang/pages/BarangPage"
import PegawaiServisPage from "./pages/pegawai/servis/ServisPage"
import PegawaiServisDetailPage from "./pages/pegawai/servis/ServisDetailPage"
import LaporanPegawaiPage from "./pages/pegawai/laporan/LaporanPegawaiPage"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/api/servis/search" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pegawai"
          element={
            <ProtectedRoute role="admin">
              <AdminPegawaiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Pegawai Routes */}
        <Route
          path="/pegawai/dashboard"
          element={
            <ProtectedRoute role="pegawai">
              <PegawaiDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pegawai/barang"
          element={
            <ProtectedRoute role="pegawai">
              <PegawaiBarangPage />
            </ProtectedRoute>
          }
        />
        {/* LIST */}
        <Route
          path="/pegawai/servis"
          element={
            <ProtectedRoute allowedRoles={["pegawai"]}>
              <PegawaiServisPage />
            </ProtectedRoute>
          }
        />

        {/* MODE TAMBAH */}
        <Route
          path="/pegawai/servis/tambah"
          element={
            <ProtectedRoute allowedRoles={["pegawai"]}>
              <PegawaiServisDetailPage mode="tambah" /> {/* FIXED */}
            </ProtectedRoute>
          }
        />

        {/* MODE EDIT */}
        <Route
          path="/pegawai/servis/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["pegawai"]}>
              <PegawaiServisDetailPage mode="edit" />
            </ProtectedRoute>
          }
        />

        {/* MODE DETAIL */}
        <Route
          path="/pegawai/servis/detail/:id"
          element={
            <ProtectedRoute allowedRoles={["pegawai"]}>
              <PegawaiServisDetailPage mode="detail" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pegawai/laporan"
          element={
            <ProtectedRoute allowedRoles={["pegawai"]}>
              <LaporanPegawaiPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
