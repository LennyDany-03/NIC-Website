import AdminBackdrop from "@/components/Admin/Backdrop";

/**
 * Everything under /admin stands on the same corridor still — see Backdrop.
 * The bar is not here: /admin/login is inside this tree and has nobody to
 * sign out yet, so the chrome belongs to the dashboard's own layout.
 */
export const metadata = {
  title: "NIC Admin",
  // Nothing under here should ever turn up in a search result.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminBackdrop />
      {/*
       * Explicitly above the backdrop rather than leaving the backdrop on a
       * negative z-index: a fixed element sent behind its own stacking
       * context is a layer that simply never appears.
       */}
      <div className="relative z-10 min-h-viewport">{children}</div>
    </>
  );
}
