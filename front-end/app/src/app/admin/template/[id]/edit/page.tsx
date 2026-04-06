import EditInvoiceClient from "./EditInvoiceClient";

export default async function Page({ params }: any) {
  const resolvedParams = await params;
  return <EditInvoiceClient id={resolvedParams.id} />;
}