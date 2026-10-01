import Table from "@/components/Table";
import { getAllProperties, getOwners, money, nameMap } from "@/lib/data";

export default async function AdminProperties() {
  const [props, owners] = await Promise.all([getAllProperties(), getOwners()]);
  const ownerName = nameMap(owners);
  return (
    <>
      <h1 className="text-3xl font-semibold">Properties</h1>
      <Table head={["Name", "Location", "Owner", "Nightly", "Rating"]}
        rows={props.map((p) => [p.name, `${p.city}, ${p.region}`, ownerName(p.ownerId), money(p.nightlyRate), p.rating])} />
    </>
  );
}
