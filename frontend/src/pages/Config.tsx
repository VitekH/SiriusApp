import { Link } from "react-router";

export default function Config() {
  return (
    <>
      <h1>Konfigurace</h1>
      <Link to={"/konfigurace/plan-akci"}>Plán akcí</Link>
    </>
  );
}
