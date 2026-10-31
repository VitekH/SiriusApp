import { Link } from "react-router";
export default function Database() {
  return (
    <>
      <h1>Databáze</h1>
      <Link to={"/databaze/prava"}>Práva</Link>
    </>
  );
}
