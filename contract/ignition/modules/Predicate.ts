import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const predicate = m.contract("Predicate");
  return { predicate };
});

export default DeployModule;