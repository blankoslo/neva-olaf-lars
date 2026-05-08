import TripSectionNav from "./TripSectionNav";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <TripSectionNav tripId={id} />
      {children}
    </>
  );
}
