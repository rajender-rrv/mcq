export async function DELETE(req, { params }) {
  const { id } = params;

  // ⚠️ In real app: delete from DB
  return Response.json({ success: true, id });
}