import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const predicate = m.contract("Predicate");
  return { predicate };
});

export default DeployModule;
// 0x7Fd0282c8D02be2a03A6c9e543B276c42e27e119 - LOP
// 0xeb2F26441508AeC79B506F01420d7785570ADf8b - Predicate